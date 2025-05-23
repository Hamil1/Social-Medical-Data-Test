
import { query } from "../db.mjs";

export const actualizarPacienteHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    throw new Error(
      `actualizarPaciente solo acepta el método PUT, intentaste: ${event.httpMethod}`
    );
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
  const {
    nombre,
    documento_identidad,
    telefono,
    email,
    direccion,
    historial_clinico,
    fecha_registro,
    odontologo_id,
  } = body;
  if (
    !nombre ||
    !documento_identidad ||
    !telefono ||
    !email ||
    !direccion ||
    !fecha_registro ||
    !odontologo_id
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  try {
    const result = await query(
      `UPDATE pacientes SET nombre=$1, documento_identidad=$2, telefono=$3, email=$4, direccion=$5, historial_clinico=$6, fecha_registro=$7, odontologo_id=$8 WHERE id=$9 RETURNING *`,
      [
        nombre,
        documento_identidad,
        telefono,
        email,
        direccion,
        historial_clinico || null,
        fecha_registro,
        odontologo_id,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Paciente no encontrado" }),
      };
    }
    return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error actualizando paciente",
        details: err.message,
      }),
    };
  }
};
