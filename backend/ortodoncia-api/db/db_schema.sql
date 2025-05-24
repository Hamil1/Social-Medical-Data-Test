-- Estructura de base de datos para clínica odontológica

CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL -- ('odontologo', 'asistente', 'administrador')
);

CREATE TABLE Pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    documento_identidad VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    email VARCHAR(100),
    direccion VARCHAR(255),
    historial_clinico TEXT,
    fecha_registro DATE NOT NULL,
    odontologo_id INT REFERENCES Usuarios(id)
);

CREATE TABLE Procedimientos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    insumos_necesarios TEXT -- Puede ser lista separada por comas o JSON
);

CREATE TABLE Inventario (
    id SERIAL PRIMARY KEY,
    nombre_insumo VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL
);

CREATE TABLE Facturas (
    id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL REFERENCES Pacientes(id),
    monto_total DECIMAL(10,2) NOT NULL,
    estado_pago VARCHAR(20) NOT NULL, -- ('pendiente', 'pagado', 'cancelado')
    fecha_emision DATE NOT NULL,
    fecha_pago DATE
);

CREATE TABLE Consultas_Procedimientos (
    id SERIAL PRIMARY KEY,
    paciente_id INT NOT NULL REFERENCES Pacientes(id),
    procedimiento_id INT NOT NULL REFERENCES Procedimientos(id),
    odontologo_id INT NOT NULL REFERENCES Usuarios(id),
    fecha_realizacion DATE NOT NULL,
    notas_clinicas TEXT,
    factura_id INT REFERENCES Facturas(id),
    estatus VARCHAR(20)
);

-- Tabla pivote para registrar insumos usados en cada procedimiento realizado
CREATE TABLE IF NOT EXISTS consultas_procedimientos_insumos (
    id SERIAL PRIMARY KEY,
    consulta_procedimiento_id INT NOT NULL REFERENCES Consultas_Procedimientos(id),
    insumo_id INT NOT NULL REFERENCES Inventario(id),
    cantidad_utilizada INT NOT NULL
);
