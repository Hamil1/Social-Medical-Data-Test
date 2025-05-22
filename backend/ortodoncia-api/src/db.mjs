// Módulo de conexión a PostgreSQL para el backend de Ortodoncia API
import pkg from "pg";
const { Pool } = pkg;

// Configuración de la conexión, usa variables de entorno para flexibilidad
const pool = new Pool({
  host: process.env.PGHOST || "host.docker.internal",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "ortodoncia",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  // ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false // Descomenta para RDS
});

// Exporta una función para hacer consultas
export const query = (text, params) => pool.query(text, params);

// Exporta el pool por si se necesita acceso directo
export { pool };

// Ejemplo de uso:
// import { query } from './db.mjs';
// const result = await query('SELECT * FROM usuarios');
