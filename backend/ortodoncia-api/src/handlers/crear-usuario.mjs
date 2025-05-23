import { query } from "../db.mjs";

export const crearUsuarioHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `crearUsuario solo acepta el método POST, intentaste: ${event.httpMethod}`,
      }),
    };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const { nombre, email, contrasena, rol } = body;
  if (!nombre || !email || !contrasena || !rol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  try {
    // Por ahora, la contraseña se guarda en texto plano (mejorar con hash en producción)
    const result = await query(
      `INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol`,
      [nombre, email, contrasena, rol]
    );
    return {
      statusCode: 201,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error creando usuario",
        details: err.message,
      }),
    };
  }
};

// Para AWS Lambda, exportar como default también
export default crearUsuarioHandler;
