import { query } from "../db.mjs";

export const getAllConsultasProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }
  try {
    // Trae todos los procedimientos realizados, incluyendo el precio del procedimiento
    const { rows } = await query(
      `SELECT cp.*, p.precio
       FROM Consultas_Procedimientos cp
       JOIN Procedimientos p ON cp.procedimiento_id = p.id`
    );
    // Para cada consulta, obtener sus insumos utilizados con cantidad y nombre
    for (const consulta of rows) {
      const insumos = await query(
        `SELECT cpi.insumo_id, i.nombre_insumo, cpi.cantidad_utilizada
         FROM consultas_procedimientos_insumos cpi
         JOIN inventario i ON i.id = cpi.insumo_id
         WHERE cpi.consulta_procedimiento_id = $1`,
        [consulta.id]
      );
      consulta.insumos_utilizados = insumos.rows;
    }
    return {
      statusCode: 200,
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error al obtener procedimientos realizados",
        details: err.message,
      }),
    };
  }
};
