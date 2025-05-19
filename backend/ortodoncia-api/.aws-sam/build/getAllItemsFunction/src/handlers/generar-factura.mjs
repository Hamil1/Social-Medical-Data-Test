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
// Generar factura desde procedimientos realizados
export const generarFacturaHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `generarFactura solo acepta el método POST, intentaste: ${event.httpMethod}`
    );
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const { paciente_id } = body;
  if (!paciente_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta paciente_id" }),
    };
  }
  let facturas = [],
    consultas = [],
    procedimientos = [];
  try {
    facturas = await readOrInitJson("facturas.json");
    consultas = await readOrInitJson("consultas_procedimientos.json");
    procedimientos = await readOrInitJson("procedimientos.json");
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo archivos de datos" }),
    };
  }
  // Buscar procedimientos realizados y no facturados para el paciente
  const consultasPendientes = consultas.filter(
    (c) => c.paciente_id === paciente_id && !c.factura_id
  );
  if (!consultasPendientes.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error:
          "No hay procedimientos pendientes de facturar para este paciente",
      }),
    };
  }
  // Calcular monto total
  let monto_total = 0;
  for (const consulta of consultasPendientes) {
    const proc = procedimientos.find((p) => p.id === consulta.procedimiento_id);
    if (proc) monto_total += proc.precio;
  }
  // Crear factura
  const nuevaFactura = {
    id: facturas.length ? Math.max(...facturas.map((f) => f.id)) + 1 : 1,
    paciente_id,
    monto_total,
    estado_pago: "pendiente",
    fecha_emision: new Date().toISOString().slice(0, 10),
    fecha_pago: null,
  };
  facturas.push(nuevaFactura);
  // Relacionar consultas con la nueva factura
  for (const consulta of consultasPendientes) {
    consulta.factura_id = nuevaFactura.id;
  }
  await writeJson("facturas.json", facturas);
  await writeJson("consultas_procedimientos.json", consultas);
  return { statusCode: 201, body: JSON.stringify(nuevaFactura) };
};
