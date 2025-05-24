import { query } from "../db.mjs";

export const eliminarConsultaProcedimientoHandler = async (event) => {
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
    // Eliminar primero los insumos asociados (detalle)
    await query(
      "DELETE FROM consultas_procedimientos_insumos WHERE consulta_procedimiento_id = $1",
      [id]
    );
    // Luego eliminar el procedimiento principal
    const result = await query(
      "DELETE FROM consultas_procedimientos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Consulta/Procedimiento no encontrado" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Consulta/Procedimiento eliminado correctamente",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error eliminando consulta/procedimiento",
        details: err.message,
      }),
    };
  }
};

export default eliminarConsultaProcedimientoHandler;
