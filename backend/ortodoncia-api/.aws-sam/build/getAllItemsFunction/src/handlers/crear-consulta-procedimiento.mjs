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
    // Si ya existe en /tmp, úsalo
    const data = await fs.readFile(tmpPath, "utf-8");
    return JSON.parse(data);
  } catch {
    // Si no existe, cópialo desde mocks y úsalo
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

export const crearConsultaProcedimientoHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `crearConsultaProcedimiento solo acepta el método POST, intentaste: ${event.httpMethod}`
    );
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "JSON inválido en el body" }),
    };
  }
  const {
    paciente_id,
    procedimiento_id,
    odontologo_id,
    fecha_realizacion,
    notas_clinicas,
  } = body;
  if (
    !paciente_id ||
    !procedimiento_id ||
    !odontologo_id ||
    !fecha_realizacion
  ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Faltan campos obligatorios" }),
    };
  }
  // Leer mocks desde /tmp o inicializar
  let consultas = [],
    inventario = [],
    facturas = [],
    procedimientos = [];
  try {
    consultas = await readOrInitJson("consultas_procedimientos.json");
    inventario = await readOrInitJson("inventario.json");
    facturas = await readOrInitJson("facturas.json");
    procedimientos = await readOrInitJson("procedimientos.json");
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error leyendo archivos de datos" }),
    };
  }
  // Buscar procedimiento y sus insumos
  const procedimiento = procedimientos.find((p) => p.id === procedimiento_id);
  if (!procedimiento) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Procedimiento no encontrado" }),
    };
  }
  // Descontar insumos del inventario
  let insumos_alerta = [];
  for (const insumoNombre of procedimiento.insumos_necesarios || []) {
    const insumo = inventario.find((i) => i.nombre_insumo === insumoNombre);
    if (insumo) {
      insumo.cantidad = Math.max(0, insumo.cantidad - 1);
      if (insumo.cantidad < 5) {
        insumos_alerta.push(insumo.nombre_insumo);
      }
    }
  }
  await writeJson("inventario.json", inventario);
  // Crear nueva consulta/procedimiento
  const nuevaConsulta = {
    id: consultas.length ? Math.max(...consultas.map((c) => c.id)) + 1 : 1,
    paciente_id,
    procedimiento_id,
    odontologo_id,
    fecha_realizacion,
    notas_clinicas,
    factura_id: null,
  };
  consultas.push(nuevaConsulta);
  await writeJson("consultas_procedimientos.json", consultas);
  // Facturación automática: buscar factura pendiente o crear nueva
  let factura = facturas.find(
    (f) => f.paciente_id === paciente_id && f.estado_pago === "pendiente"
  );
  if (!factura) {
    factura = {
      id: facturas.length ? Math.max(...facturas.map((f) => f.id)) + 1 : 1,
      paciente_id,
      monto_total: procedimiento.precio,
      estado_pago: "pendiente",
      fecha_emision: fecha_realizacion,
      fecha_pago: null,
    };
    facturas.push(factura);
  } else {
    factura.monto_total += procedimiento.precio;
  }
  nuevaConsulta.factura_id = factura.id;
  await writeJson("facturas.json", facturas);
  await writeJson("consultas_procedimientos.json", consultas);
  return {
    statusCode: 201,
    body: JSON.stringify({
      consulta: nuevaConsulta,
      factura,
      alerta_stock: insumos_alerta.length
        ? `Stock bajo para: ${insumos_alerta.join(", ")}`
        : undefined,
    }),
  };
};
