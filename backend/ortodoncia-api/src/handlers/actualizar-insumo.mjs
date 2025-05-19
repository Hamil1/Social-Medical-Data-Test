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
export const actualizarInsumoHandler = async (event) => {
  if (event.httpMethod !== "PUT") {
    throw new Error(
      `actualizarInsumo solo acepta el método PUT, intentaste: ${event.httpMethod}`
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
  let inventario = [];
  try {
    inventario = await readOrInitJson("inventario.json");
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo inventario" }),
    };
  }
  const idx = inventario.findIndex((i) => i.id === id);
  if (idx === -1) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Insumo no encontrado" }),
    };
  }
  inventario[idx] = { ...inventario[idx], ...body, id };
  await writeJson("inventario.json", inventario);
  return { statusCode: 200, body: JSON.stringify(inventario[idx]) };
};
