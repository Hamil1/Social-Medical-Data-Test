-- Seeder para la tabla Pacientes
INSERT INTO Pacientes (nombre, documento_identidad, telefono, email, direccion, historial_clinico, fecha_registro) VALUES
('Ana Pérez', '001-1234567-8', '809-555-1111', 'ana.perez@mail.com', 'Calle 10, Santo Domingo', 'Sin antecedentes relevantes.', '2025-05-21'),
('José Gómez', '001-7654321-9', '809-555-2222', 'jose.gomez@mail.com', 'Calle 5, Santiago', 'Alergia a penicilina.', '2025-05-21');

-- Seeder para la tabla Procedimientos
INSERT INTO Procedimientos (nombre, precio, descripcion, insumos_necesarios) VALUES
('Limpieza dental', 3000, 'Profilaxis general', 'Guantes de látex, Pasta profiláctica'),
('Extracción de muela', 5000, 'Extracción simple', 'Guantes de látex, Jeringas de anestesia, Anestesia local'),
('Blanqueamiento dental', 8000, 'Procedimiento estético', 'Guantes de látex, Pasta profiláctica'),
('Colocación de brackets', 15000, 'Inicio de tratamiento de ortodoncia', 'Guantes de látex');

-- Seeder para la tabla Inventario
INSERT INTO Inventario (nombre_insumo, cantidad, unidad_medida, fecha_vencimiento, costo_unitario) VALUES
('Guantes de látex', 500, 'unidades', '2026-01-01', 15),
('Jeringas de anestesia', 200, 'unidades', '2025-12-01', 50),
('Pasta profiláctica', 50, 'tubos', '2025-06-15', 200),
('Anestesia local', 100, 'frascos', '2025-11-30', 1000);
