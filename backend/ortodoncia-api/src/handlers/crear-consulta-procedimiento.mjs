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
      `INSERT INTO consultas_procedimientos (paciente_id, procedimiento_id, odontologo_id, fecha_realizacion, notas_clinicas, estatus)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        paciente_id,
        procedimiento_id,
        odontologo_id,
        fecha_realizacion,
        notas_clinicas || null,
        "pendiente",
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

    // Elimina la lógica de facturación automática
    return {
      statusCode: 201,
      body: JSON.stringify({
        consulta: result.rows[0],
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
