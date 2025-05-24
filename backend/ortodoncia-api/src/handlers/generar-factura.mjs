import { query } from "../db.mjs";

// Generar factura desde procedimientos realizados
export const generarFacturaHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `generarFactura solo acepta el método POST, intentaste: ${event.httpMethod}`
    );
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const { paciente_id, procedimientos_ids } = body;
  if (
    !paciente_id ||
    !Array.isArray(procedimientos_ids) ||
    procedimientos_ids.length === 0
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Faltan paciente_id o procedimientos_ids",
      }),
    };
  }
  try {
    // 1. Obtener los procedimientos realizados pendientes y seleccionados
    const { rows: consultas } = await query(
      `SELECT cp.id, cp.procedimiento_id, p.precio
       FROM Consultas_Procedimientos cp
       JOIN Procedimientos p ON cp.procedimiento_id = p.id
       WHERE cp.paciente_id = $1
         AND cp.id = ANY($2)
         AND cp.factura_id IS NULL`,
      [paciente_id, procedimientos_ids]
    );
    if (!consultas.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "No hay procedimientos válidos para facturar",
        }),
      };
    }
    // 2. Calcular monto total
    const monto_total = consultas.reduce((sum, c) => sum + Number(c.precio), 0);
    // 3. Crear la factura
    const { rows: facturaRows } = await query(
      `INSERT INTO Facturas (paciente_id, monto_total, estado_pago, fecha_emision)
       VALUES ($1, $2, 'pendiente', CURRENT_DATE)
       RETURNING *`,
      [paciente_id, monto_total]
    );
    const factura = facturaRows[0];
    // 4. Actualizar los procedimientos realizados para asociarlos a la factura y marcar como facturado
    await query(
      `UPDATE Consultas_Procedimientos SET factura_id = $1, estatus = 'facturado' WHERE id = ANY($2)`,
      [factura.id, procedimientos_ids]
    );
    return {
      statusCode: 201,
      body: JSON.stringify(factura),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al generar factura",
        details: err.message,
      }),
    };
  }
};
