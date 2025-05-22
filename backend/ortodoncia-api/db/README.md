# Requisitos de Node.js y configuración con nvm

Se recomienda usar **Node.js versión 20.x LTS** para asegurar compatibilidad con las dependencias del backend. El sistema ha sido probado con Node.js 20.x.

### Verificar versión actual

```sh
node -v
```

### Instalar Node.js con nvm (recomendado)

Si no tienes Node.js o quieres gestionar varias versiones fácilmente, instala [nvm](https://github.com/nvm-sh/nvm):

#### En macOS/Linux

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Cierra y abre tu terminal, luego ejecuta:
nvm install 18 # o nvm install 20
nvm use 18     # o nvm use 20
```

#### En Windows

Usa [nvm-windows](https://github.com/coreybutler/nvm-windows) y sigue las instrucciones del repositorio. Puedes instalar la versión 18 o 20 según prefieras.

---

# Scripts de Base de Datos para Ortodoncia API

Esta carpeta contiene los scripts SQL para la creación y carga de datos de la base de datos del sistema odontológico.

## Archivos incluidos

- `db_schema.sql`: Estructura de todas las tablas principales.
- `seed_usuarios.sql`: Datos de ejemplo para la tabla Usuarios.
- `seed_pacientes.sql`: Datos de ejemplo para la tabla Pacientes.
- `seed_procedimientos.sql`: Datos de ejemplo para la tabla Procedimientos.
- `seed_inventario.sql`: Datos de ejemplo para la tabla Inventario.
- `seed_facturas.sql`: Datos de ejemplo para la tabla Facturas.
- `seed_consultas_procedimientos.sql`: Datos de ejemplo para la tabla Consultas_Procedimientos.

## Uso recomendado

1. Crea la base de datos en tu motor preferido (PostgreSQL, MySQL, etc).
2. Ejecuta primero el script de estructura:

   ```sh
   psql -U <usuario> -d <basededatos> -f db_schema.sql
   # o para MySQL:
   # mysql -u <usuario> -p <basededatos> < db_schema.sql
   ```

3. Ejecuta los seeders en el siguiente orden:

   1. `seed_usuarios.sql`
   2. `seed_pacientes.sql`
   3. `seed_procedimientos.sql`
   4. `seed_inventario.sql`
   5. `seed_facturas.sql`
   6. `seed_consultas_procedimientos.sql`

   Puedes hacerlo con:

   ```sh
   psql -U <usuario> -d <basededatos> -f seed_usuarios.sql
   # ...y así sucesivamente para cada archivo
   ```

## Levantar PostgreSQL con Docker y cargar la base de datos

1. Levanta un contenedor de PostgreSQL (puedes cambiar la contraseña y el nombre de la base si lo deseas):

   ```sh
   docker run --name ortodoncia-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ortodoncia -p 5432:5432 -d postgres:14
   ```

2. Conéctate al contenedor desde tu terminal (requiere tener instalado `psql`):

   ```sh
   psql -h localhost -U postgres -d ortodoncia
   # Cuando pida contraseña, usa la que pusiste en POSTGRES_PASSWORD
   ```

3. Ejecuta los scripts de migración y seeders (desde la carpeta backend/ortodoncia-api/db):

   ```sh
   psql -h localhost -U postgres -d ortodoncia -f db_schema.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_usuarios.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_pacientes.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_procedimientos.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_inventario.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_facturas.sql
   psql -h localhost -U postgres -d ortodoncia -f seed_consultas_procedimientos.sql
   ```

4. (Opcional) Puedes conectarte con pgAdmin usando:
   - Host: `localhost`
   - Puerto: `5432`
   - Usuario: `postgres`
   - Contraseña: `postgres`
   - Base de datos: `ortodoncia`

## Notas

- Los datos de ejemplo están pensados para desarrollo y pruebas.
- Puedes modificar o ampliar los seeders según tus necesidades.
- Si necesitas limpiar la base, puedes usar TRUNCATE en las tablas (respetando el orden de dependencias).

---

Cualquier duda o sugerencia, contacta al equipo de desarrollo.
