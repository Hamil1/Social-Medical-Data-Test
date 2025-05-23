import { query } from "../db.mjs";

export const crearConsultaProcedimientoHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const {
    paciente_id,
    procedimiento_id,
    odontologo_id,
    fecha_realizacion,
    notas_clinicas,
    insumos_utilizados, // <-- Asegúrate de recibir este campo desde el frontend
  } = body;
  if (
    !paciente_id ||
    !procedimiento_id ||
    !odontologo_id ||
    !fecha_realizacion
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  try {
    // 1. Obtener insumos necesarios del procedimiento
    const procRes = await query(
      "SELECT insumos_necesarios, precio FROM procedimientos WHERE id = $1",
      [procedimiento_id]
    );
    if (!procRes.rows.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Procedimiento no encontrado" }),
      };
    }
    let insumos = procRes.rows[0].insumos_necesarios;
    const precioProcedimiento = Number(procRes.rows[0].precio);
    if (!insumos) insumos = [];
    else if (insumos.trim().startsWith("[")) insumos = JSON.parse(insumos);
    else
      insumos = insumos
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

    // 2. Descontar inventario y recolectar alertas de stock bajo
    let insumos_alerta = [];
    // Si insumos_utilizados viene del frontend, úsalo para cantidades
    if (Array.isArray(insumos_utilizados) && insumos_utilizados.length > 0) {
      for (const iu of insumos_utilizados) {
        // Descontar del inventario la cantidad utilizada
        await query(
          `UPDATE inventario SET cantidad = GREATEST(cantidad - $1, 0) WHERE id = $2`,
          [iu.cantidad_utilizada, iu.insumo_id]
        );
        // Verificar stock bajo
        const stockRes = await query(
          `SELECT cantidad, nombre_insumo FROM inventario WHERE id = $1`,
          [iu.insumo_id]
        );
        if (stockRes.rows.length && stockRes.rows[0].cantidad < 5) {
          insumos_alerta.push(stockRes.rows[0].nombre_insumo);
        }
      }
    } else {
      // Lógica anterior (por compatibilidad)
      for (const nombreInsumo of insumos) {
        await query(
          `UPDATE inventario SET cantidad = GREATEST(cantidad - 1, 0) WHERE nombre_insumo = $1`,
          [nombreInsumo]
        );
        const stockRes = await query(
          `SELECT cantidad FROM inventario WHERE nombre_insumo = $1`,
          [nombreInsumo]
        );
        if (stockRes.rows.length && stockRes.rows[0].cantidad < 5) {
          insumos_alerta.push(nombreInsumo);
        }
      }
    }

    // 3. Insertar la consulta/procedimiento realizado
    const result = await query(
      `INSERT INTO consultas_procedimientos (paciente_id, procedimiento_id, odontologo_id, fecha_realizacion, notas_clinicas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        paciente_id,
        procedimiento_id,
        odontologo_id,
        fecha_realizacion,
        notas_clinicas || null,
      ]
    );

    // 3.1. Insertar insumos utilizados en la tabla detalle
    if (Array.isArray(insumos_utilizados) && insumos_utilizados.length > 0) {
      for (const iu of insumos_utilizados) {
        await query(
          `INSERT INTO consultas_procedimientos_insumos (consulta_procedimiento_id, insumo_id, cantidad_utilizada)
           VALUES ($1, $2, $3)`,
          [result.rows[0].id, iu.insumo_id, iu.cantidad_utilizada]
        );
      }
    }

    // 4. Facturación automática: buscar factura pendiente o crear nueva
    let factura;
    const facturaRes = await query(
      `SELECT * FROM facturas WHERE paciente_id = $1 AND estado_pago = 'pendiente' LIMIT 1`,
      [paciente_id]
    );
    if (facturaRes.rows.length) {
      // Actualizar monto_total
      factura = facturaRes.rows[0];
      await query(
        `UPDATE facturas SET monto_total = monto_total + $1 WHERE id = $2`,
        [precioProcedimiento, factura.id]
      );
    } else {
      // Crear nueva factura
      const nuevaFacturaRes = await query(
        `INSERT INTO facturas (paciente_id, monto_total, estado_pago, fecha_emision) VALUES ($1, $2, 'pendiente', $3) RETURNING *`,
        [paciente_id, precioProcedimiento, fecha_realizacion]
      );
      factura = nuevaFacturaRes.rows[0];
    }
    // Asociar la factura a la consulta recién creada
    await query(
      `UPDATE consultas_procedimientos SET factura_id = $1 WHERE id = $2`,
      [factura.id, result.rows[0].id]
    );

    return {
      statusCode: 201,
      body: JSON.stringify({
        consulta: result.rows[0],
        factura,
        alerta_stock:
          insumos_alerta.length > 0
            ? `Stock bajo para: ${insumos_alerta.join(", ")}`
            : undefined,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error creando consulta/procedimiento",
        details: err.message,
      }),
    };
  }
};

export const obtenerConsultasProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  try {
    // Obtener todas las consultas/procedimientos
    const consultas = await query("SELECT * FROM consultas_procedimientos");
    // Para cada consulta, obtener sus insumos utilizados con cantidad
    for (const consulta of consultas.rows) {
      const insumos = await query(
        `SELECT cpi.insumo_id, i.nombre_insumo, cpi.cantidad_utilizada
         FROM consultas_procedimientos_insumos cpi
         JOIN inventario i ON i.id = cpi.insumo_id
         WHERE cpi.consulta_procedimiento_id = $1`,
        [consulta.id]
      );
      consulta.insumos_utilizados = insumos.rows;
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ consultas: consultas.rows }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error obteniendo consultas/procedimientos",
        details: err.message,
      }),
    };
  }
};
