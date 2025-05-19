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
export const eliminarPacienteHandler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    throw new Error(
      `eliminarPaciente solo acepta el método DELETE, intentaste: ${event.httpMethod}`
    );
  }
  const id = parseInt(event.pathParameters.id, 10);
  let pacientes = [];
  try {
    pacientes = await readOrInitJson("pacientes.json");
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo pacientes" }),
    };
  }
  const idx = pacientes.findIndex((p) => p.id === id);
  if (idx === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Paciente no encontrado" }),
    };
  }
  pacientes.splice(idx, 1);
  await writeJson("pacientes.json", pacientes);
  return { statusCode: 204 };
};
