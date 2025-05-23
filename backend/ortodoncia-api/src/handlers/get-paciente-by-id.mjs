import { query } from "../db.mjs";

export const getPacienteByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getPacienteById solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  const id = parseInt(event.pathParameters.id, 10);
  try {
    const result = await query(
      `SELECT p.*, u.nombre as odontologo_nombre FROM pacientes p LEFT JOIN usuarios u ON p.odontologo_id = u.id WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Paciente no encontrado" }),
      };
    }
    return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando paciente",
        details: err.message,
      }),
    };
  }
};
