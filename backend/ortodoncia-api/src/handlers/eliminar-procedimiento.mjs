import { query } from "../db.mjs";

export const eliminarProcedimientoHandler = async (event) => {
  try {
    const id = event.pathParameters.id;
    await query("DELETE FROM procedimientos WHERE id = $1", [id]);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Procedimiento eliminado" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error al eliminar procedimiento",
        error: error.message,
      }),
    };
  }
};
