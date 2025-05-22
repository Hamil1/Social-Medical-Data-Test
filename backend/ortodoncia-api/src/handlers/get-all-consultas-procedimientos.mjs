import { query } from "../db.mjs";

export const getAllConsultasProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllConsultasProcedimientos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM consultas_procedimientos");
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando consultas_procedimientos",
        details: err.message,
      }),
    };
  }
};
