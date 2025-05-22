import { query } from "../db.mjs";

export const getAllProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllProcedimientos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM procedimientos");
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando procedimientos",
        details: err.message,
      }),
    };
  }
};
