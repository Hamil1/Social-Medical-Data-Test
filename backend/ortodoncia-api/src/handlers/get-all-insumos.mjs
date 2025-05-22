import { query } from "../db.mjs";

// Handler para obtener todos los insumos (desde PostgreSQL)
export const getAllInsumosHandler = async (event) => {
  if (event.httpMethod && event.httpMethod !== "GET") {
    throw new Error(
      `getAllInsumos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM inventario");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando insumos",
        details: err.message,
      }),
    };
  }
};
