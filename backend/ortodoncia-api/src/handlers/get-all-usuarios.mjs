import { query } from "../db.mjs";

export const getAllUsuariosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllUsuarios solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM usuarios");
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando usuarios",
        details: err.message,
      }),
    };
  }
};
