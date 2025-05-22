import { query } from "../db.mjs";

export const getAllFacturasHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllFacturas solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM facturas");
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando facturas",
        details: err.message,
      }),
    };
  }
};
