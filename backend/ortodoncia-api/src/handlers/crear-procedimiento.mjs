import { query } from "../db.mjs";

export const crearProcedimientoHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  try {
    const { nombre, precio, descripcion, insumos_necesarios } = JSON.parse(
      event.body
    );
    if (!nombre || !precio || !descripcion) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Faltan campos obligatorios (nombre, precio, descripcion)",
        }),
      };
    }
    const result = await query(
      `INSERT INTO procedimientos (nombre, precio, descripcion, insumos_necesarios)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, precio, descripcion, insumos_necesarios || null]
    );
    return {
      statusCode: 201,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error creando procedimiento",
        details: err.message,
      }),
    };
  }
};
