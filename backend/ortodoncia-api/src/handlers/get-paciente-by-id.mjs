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
export const getPacienteByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getPacienteById solo acepta el método GET, intentaste: ${event.httpMethod}`
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
  const paciente = pacientes.find((p) => p.id === id);
  if (!paciente) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Paciente no encontrado" }),
    };
  }
  return { statusCode: 200, body: JSON.stringify(paciente) };
};
