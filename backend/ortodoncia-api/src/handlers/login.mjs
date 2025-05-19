import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";
const MOCKS_DIR = "/var/task/src/mocks/";
const SECRET = "supersecretkey";

function getMockPath(filename) {
  return path.join(MOCKS_DIR, filename);
}

async function readUsuarios() {
  const data = await fs.readFile(getMockPath("usuarios.json"), "utf-8");
  return JSON.parse(data);
}

export const loginHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `login solo acepta el método POST, intentaste: ${event.httpMethod}`
    );
  }
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "*",
  };
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const { email, contrasena } = body;
  if (!email || !contrasena) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  let usuarios = [];
  try {
    usuarios = await readUsuarios();
  } catch {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Error leyendo usuarios" }),
    };
  }
  const usuario = usuarios.find(
    (u) => u.email === email && contrasena === "1234" // Simulación
  );
  if (!usuario) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Credenciales inválidas" }),
    };
  }
  const token = jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      email: usuario.email,
    },
    SECRET,
    { expiresIn: "8h" }
  );
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email,
      },
    }),
  };
};
