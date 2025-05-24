import { query } from "../db.mjs";
export const actualizarFacturaHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  const id = parseInt(event.pathParameters.id, 10);
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const { estado_pago, fecha_pago } = body;
  if (!estado_pago) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta estado_pago" }),
    };
  }
  try {
    // Actualizar la factura en la base de datos
    const result = await query(
      `UPDATE facturas SET estado_pago = $1, fecha_pago = $2 WHERE id = $3 RETURNING *`,
      [estado_pago, fecha_pago, id]
    );
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Factura no encontrada" }),
      };
    }
    // Si la factura se marca como pagada, actualizar los procedimientos relacionados
    if (estado_pago === "pagada") {
      await query(
        `UPDATE Consultas_Procedimientos SET estatus = 'pagado' WHERE factura_id = $1`,
        [id]
      );
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error actualizando factura",
        details: err.message,
      }),
    };
  }
};
