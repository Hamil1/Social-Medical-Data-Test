import fs from "fs/promises";
const USUARIOS_PATH = new URL("../mocks/usuarios.json", import.meta.url);

export const getAllUsuariosHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllUsuarios solo acepta el método GET, intentaste: ${event.httpMethod}`
    );
  }
  let items = [];
  try {
    const data = await fs.readFile(USUARIOS_PATH, "utf-8");
    items = JSON.parse(data);
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo usuarios" }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(items),
  };
};
