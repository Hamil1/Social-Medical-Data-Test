import { query } from "../db.mjs";

export const actualizarUsuarioHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
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
  const { nombre, email, rol } = body;
  if (!nombre || !email || !rol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  try {
    const result = await query(
      `UPDATE usuarios SET nombre=$1, email=$2, rol=$3 WHERE id=$4 RETURNING *`,
      [nombre, email, rol, id]
    );
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Usuario no encontrado" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error actualizando usuario",
        details: err.message,
      }),
    };
  }
};

export default actualizarUsuarioHandler;
