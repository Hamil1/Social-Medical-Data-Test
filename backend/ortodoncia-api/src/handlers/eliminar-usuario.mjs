import { query } from "../db.mjs";

export const eliminarUsuarioHandler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  const { id } = event.pathParameters || {};
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro id" }),
    };
  }
  try {
    const result = await query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Usuario no encontrado" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Usuario eliminado correctamente" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error eliminando usuario",
        details: err.message,
      }),
    };
  }
};

export default eliminarUsuarioHandler;
