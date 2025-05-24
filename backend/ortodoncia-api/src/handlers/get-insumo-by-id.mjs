import fs from "fs/promises";
import path from "path";
import { query } from "../db.mjs";
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
export const getInsumoByIdHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getInsumoById solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  const id = parseInt(event.pathParameters.id, 10);
  try {
    const result = await query(`SELECT * FROM inventario WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Insumo no encontrado" }),
      };
    }
    return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error consultando insumo",
        details: err.message,
      }),
    };
  }
};
