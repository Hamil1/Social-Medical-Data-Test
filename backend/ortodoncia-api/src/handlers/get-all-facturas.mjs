import fs from "fs/promises";
const FACTURAS_PATH = new URL("../mocks/facturas.json", import.meta.url);

export const getAllFacturasHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllFacturas solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  let items = [];
  try {
    const data = await fs.readFile(FACTURAS_PATH, "utf-8");
    items = JSON.parse(data);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo facturas" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
