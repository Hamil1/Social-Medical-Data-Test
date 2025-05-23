import { query } from "../db.mjs";

export const getAllPacientesHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllPacientes solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query(
      `SELECT p.*, u.nombre as odontologo_nombre FROM pacientes p LEFT JOIN usuarios u ON p.odontologo_id = u.id`
    );
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando pacientes",
        details: err.message,
      }),
    };
  }
};
