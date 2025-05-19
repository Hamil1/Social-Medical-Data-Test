import fs from "fs/promises";
import path from "path";
const MOCKS_DIR = "/var/task/src/mocks/";
const TMP_DIR = "/tmp/";
function getTmpPath(filename) {
  return path.join(TMP_DIR, filename);
}
function getMockPath(filename) {
  return path.join(MOCKS_DIR, filename);
}
async function readOrInitJson(filename) {
  const tmpPath = getTmpPath(filename);
  try {
    const data = await fs.readFile(tmpPath, "utf-8");
    return JSON.parse(data);
  } catch {
    const mockPath = getMockPath(filename);
    const data = await fs.readFile(mockPath, "utf-8");
    await fs.writeFile(tmpPath, data);
    return JSON.parse(data);
  }
}
async function writeJson(filename, data) {
  const tmpPath = getTmpPath(filename);
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
}
export const crearPacienteHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `crearPaciente solo acepta el método POST, intentaste: ${event.httpMethod}`
    );
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
  const {
    nombre,
    documento_identidad,
    telefono,
    email,
    direccion,
    historial_clinico,
    fecha_registro,
  } = body;
  if (
    !nombre ||
    !documento_identidad ||
    !telefono ||
    !email ||
    !direccion ||
    !fecha_registro
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  let pacientes = [];
  try {
    pacientes = await readOrInitJson("pacientes.json");
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo pacientes" }),
    };
  }
  const nuevoPaciente = {
    id: pacientes.length ? Math.max(...pacientes.map((p) => p.id)) + 1 : 1,
    nombre,
    documento_identidad,
    telefono,
    email,
    direccion,
    historial_clinico,
    fecha_registro,
  };
  pacientes.push(nuevoPaciente);
  await writeJson("pacientes.json", pacientes);
  return { statusCode: 201, body: JSON.stringify(nuevoPaciente) };
};
