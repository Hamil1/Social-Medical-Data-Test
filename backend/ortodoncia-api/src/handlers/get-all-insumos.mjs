import fs from "fs/promises";
const INSUMOS_PATH = new URL("../mocks/inventario.json", import.meta.url);

// Handler para obtener todos los insumos (mock)
export const getAllInsumosHandler = async (event) => {
  try {
    const data = await fs.readFile(INSUMOS_PATH, "utf-8");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo insumos" }),
    };
  }
};
