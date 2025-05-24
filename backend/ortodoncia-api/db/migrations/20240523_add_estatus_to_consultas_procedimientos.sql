-- Agrega la columna 'estatus' a Consultas_Procedimientos para control de estado de facturación
ALTER TABLE Consultas_Procedimientos ADD COLUMN estatus VARCHAR(20);
-- Opcional: inicializa los existentes como 'pendiente'
UPDATE Consultas_Procedimientos SET estatus = 'pendiente' WHERE estatus IS NULL;
