import { query } from "../db.mjs";

export const actualizarProcedimientoHandler = async (event) => {
  try {
    const id = event.pathParameters.id;
    const body = JSON.parse(event.body);
    const { nombre, precio, descripcion, insumos_necesarios } = body;
    if (!nombre || !precio || !descripcion) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Faltan campos obligatorios" }),
      };
    }
    await query(
      `UPDATE procedimientos SET nombre = $1, precio = $2, descripcion = $3, insumos_necesarios = $4 WHERE id = $5`,
      [nombre, precio, descripcion, insumos_necesarios, id]
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Procedimiento actualizado" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al actualizar procedimiento",
        error: error.message,
      }),
    };
  }
};

export default actualizarProcedimientoHandler;
