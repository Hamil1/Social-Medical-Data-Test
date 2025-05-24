import { query } from "../db.mjs";

export const actualizarConsultaProcedimientoHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `Método no permitido: ${event.httpMethod}`,
      }),
    };
  }
  try {
    const id = event.pathParameters.id;
    const {
      paciente_id,
      procedimiento_id,
      odontologo_id,
      fecha_realizacion,
      notas_clinicas,
      factura_id,
      estatus,
      insumos_utilizados, // [{insumo_id, cantidad_utilizada}, ...]
    } = JSON.parse(event.body);

    // Actualizar la consulta/procedimiento principal
    const result = await query(
      `UPDATE consultas_procedimientos
       SET paciente_id = $1,
           procedimiento_id = $2,
           odontologo_id = $3,
           fecha_realizacion = $4,
           notas_clinicas = $5,
           factura_id = $6,
           estatus = COALESCE($7, estatus)
       WHERE id = $8
       RETURNING *`,
      [
        paciente_id,
        procedimiento_id,
        odontologo_id,
        fecha_realizacion,
        notas_clinicas,
        factura_id,
        estatus,
        id,
      ]
    );
    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Consulta/procedimiento no encontrado",
        }),
      };
    }

    // Si se especifican insumos utilizados, actualiza la tabla pivote y descuenta inventario
    if (Array.isArray(insumos_utilizados)) {
      // Elimina insumos previos para este procedimiento
      await query(
        `DELETE FROM consultas_procedimientos_insumos WHERE consulta_procedimiento_id = $1`,
        [id]
      );
      for (const insumo of insumos_utilizados) {
        // Inserta el insumo usado
        await query(
          `INSERT INTO consultas_procedimientos_insumos (consulta_procedimiento_id, insumo_id, cantidad_utilizada)
           VALUES ($1, $2, $3)`,
          [id, insumo.insumo_id, insumo.cantidad_utilizada]
        );
        // Descuenta del inventario
        await query(
          `UPDATE inventario SET cantidad = cantidad - $1 WHERE id = $2`,
          [insumo.cantidad_utilizada, insumo.insumo_id]
        );
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error actualizando consulta/procedimiento",
        details: err.message,
      }),
    };
  }
};
