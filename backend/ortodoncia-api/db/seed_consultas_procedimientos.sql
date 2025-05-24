-- Seeder para la tabla Consultas_Procedimientos
-- Procedimientos ya facturados
INSERT INTO Consultas_Procedimientos (paciente_id, procedimiento_id, odontologo_id, fecha_realizacion, notas_clinicas, factura_id, estatus) VALUES
(1, 1, 2, '2025-05-21', 'Limpieza de rutina. Sin complicaciones.', 1, 'facturado'),
(2, 2, 2, '2025-05-20', 'Extracción sin complicaciones. Se indicó reposo.', 2, 'facturado');

-- Procedimientos pendientes (sin factura)
INSERT INTO Consultas_Procedimientos (paciente_id, procedimiento_id, odontologo_id, fecha_realizacion, notas_clinicas, estatus) VALUES
(1, 2, 2, '2025-05-23', 'Pendiente de facturación: Extracción de muela.', 'pendiente'),
(2, 1, 2, '2025-05-24', 'Pendiente de facturación: Limpieza anual.', 'pendiente');
