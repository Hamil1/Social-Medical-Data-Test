import fs from "fs/promises";
const PROCEDIMIENTOS_PATH = new URL(
  "../mocks/procedimientos.json",
  import.meta.url
);

export const getAllProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllProcedimientos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  let items = [];
  try {
    const data = await fs.readFile(PROCEDIMIENTOS_PATH, "utf-8");
    items = JSON.parse(data);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo procedimientos" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
