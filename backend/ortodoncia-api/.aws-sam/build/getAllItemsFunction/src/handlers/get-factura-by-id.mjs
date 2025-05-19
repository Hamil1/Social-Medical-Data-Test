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
export const getFacturaByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getFacturaById solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  const id = parseInt(event.pathParameters.id, 10);
  let facturas = [];
  try {
    facturas = await readOrInitJson("facturas.json");
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo facturas" }),
    };
  }
  const factura = facturas.find((f) => f.id === id);
  if (!factura) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Factura no encontrada" }),
    };
  }
  return { statusCode: 200, body: JSON.stringify(factura) };
};
