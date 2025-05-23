import { getClient } from "../db/db_client.mjs";

export const actualizarConsultaProcedimientoHandler = async (event) => {
  const client = await getClient();
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);
    // Aquí deberías validar y mapear los campos que pueden actualizarse
    // Ejemplo: procedimiento_id, insumos, fecha, notas, etc.
    const { procedimiento_id, insumos, fecha, notas } = body;

    // Actualizar la consulta/procedimiento realizado
    const updateQuery = `
      UPDATE consultas_procedimientos
      SET procedimiento_id = $1,
          insumos = $2,
          fecha = $3,
          notas = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [procedimiento_id, insumos, fecha, notas, id];
    const result = await client.query(updateQuery, values);
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "http://localhost:5173" },
        body: JSON.stringify({
          message: "Consulta/procedimiento no encontrado",
        }),
      };
    }
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "http://localhost:5173" },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "http://localhost:5173" },
      body: JSON.stringify({
        message: "Error al actualizar consulta/procedimiento",
        error: error.message,
      }),
    };
  } finally {
    client.release();
  }
};
