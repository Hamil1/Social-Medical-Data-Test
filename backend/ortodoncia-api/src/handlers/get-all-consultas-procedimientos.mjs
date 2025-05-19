import fs from "fs/promises";
const CONSULTAS_PATH = new URL(
  "../mocks/consultas_procedimientos.json",
  import.meta.url
);

export const getAllConsultasProcedimientosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllConsultasProcedimientos solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  let items = [];
  try {
    const data = await fs.readFile(CONSULTAS_PATH, "utf-8");
    items = JSON.parse(data);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo consultas_procedimientos" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
