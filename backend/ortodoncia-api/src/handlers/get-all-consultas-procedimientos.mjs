import { query } from "../db.mjs";

export const getAllConsultasProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllConsultasProcedimientos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  try {
    const result = await query("SELECT * FROM consultas_procedimientos");
    // Para cada consulta, obtener sus insumos utilizados con cantidad
    for (const consulta of result.rows) {
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
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando consultas_procedimientos",
        details: err.message,
      }),
    };
  }
};
