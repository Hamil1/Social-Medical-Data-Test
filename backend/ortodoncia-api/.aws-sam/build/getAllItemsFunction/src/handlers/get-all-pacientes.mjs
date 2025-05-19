import fs from "fs/promises";
const PACIENTES_PATH = new URL("../mocks/pacientes.json", import.meta.url);

export const getAllPacientesHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllPacientes solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  let items = [];
  try {
    const data = await fs.readFile(PACIENTES_PATH, "utf-8");
    items = JSON.parse(data);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo pacientes" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
