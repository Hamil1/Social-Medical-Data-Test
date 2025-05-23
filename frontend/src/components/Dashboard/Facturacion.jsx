import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Box,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../../services/api";
import jsPDF from "jspdf";

const Facturacion = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState("");
  const [odontologos, setOdontologos] = useState([]);
  const [procedimientosPendientes, setProcedimientosPendientes] = useState([]);
  const [selectedOdontologo, setSelectedOdontologo] = useState("");
  const [selectedProcedimiento, setSelectedProcedimiento] = useState("");
  const [selectedProcedimientos, setSelectedProcedimientos] = useState([]);
  const [fechaRealizacion, setFechaRealizacion] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [generando, setGenerando] = useState(false);
  const [filtro, setFiltro] = useState("pendientes");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rol = usuario?.rol;

  useEffect(() => {
    fetchFacturas();
    api.get("/pacientes").then((res) => setPacientes(res.data));
    api
      .get("/usuarios")
      .then((res) =>
        setOdontologos(res.data.filter((u) => u.rol === "odontologo"))
      );
  }, []);

  useEffect(() => {
    if (selectedPaciente) {
      api.get(`/consultas-procedimientos`).then((res) => {
        const pendientes = res.data.filter(
          (c) => c.paciente_id === Number(selectedPaciente) && !c.factura_id
        );
        setProcedimientosPendientes(pendientes);
        setSelectedProcedimientos([]);
      });
    } else {
      setProcedimientosPendientes([]);
      setSelectedProcedimientos([]);
    }
  }, [selectedPaciente, openDialog]);

  const fetchFacturas = () => {
    setLoading(true);
    api
      .get("/facturas")
      .then((res) => setFacturas(res.data))
      .catch(() => setFacturas([]))
      .finally(() => setLoading(false));
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const handleMarcarPagada = async (factura) => {
    try {
      await api.put(`/facturas/${factura.id}`, {
        ...factura,
        estado_pago: "pagada",
        fecha_pago: new Date().toISOString().slice(0, 10),
      });
      setAlert({
        open: true,
        message: "Factura marcada como pagada",
        severity: "success",
      });
      fetchFacturas();
    } catch {
      setAlert({
        open: true,
        message: "Error al marcar como pagada",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaciente("");
    setSelectedOdontologo("");
    setSelectedProcedimiento("");
    setFechaRealizacion(new Date().toISOString().slice(0, 10));
    setSelectedProcedimientos([]);
  };

  const handleGenerarFactura = async () => {
    setGenerando(true);
    try {
      await api.post("/facturas/generar", {
        paciente_id: Number(selectedPaciente),
        odontologo_id: Number(selectedOdontologo),
        procedimiento_id: Number(selectedProcedimiento),
        fecha_realizacion: fechaRealizacion,
        procedimientos_ids: selectedProcedimientos.map((p) => p.id),
      });
      setAlert({
        open: true,
        message: "Factura generada exitosamente",
        severity: "success",
      });
      fetchFacturas();
      setTimeout(() => setOpenDialog(false), 1200);
      setSelectedPaciente("");
      setSelectedOdontologo("");
      setSelectedProcedimiento("");
      setFechaRealizacion(new Date().toISOString().slice(0, 10));
      setSelectedProcedimientos([]);
    } catch {
      setAlert({
        open: true,
        message: "Error al generar factura",
        severity: "error",
      });
    } finally {
      setGenerando(false);
    }
  };

  // Descargar PDF real
  const handleDescargarPDF = (factura) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Factura Odontológica", 20, 20);
    doc.setFontSize(12);
    doc.text(`ID: ${factura.id}`, 20, 35);
    doc.text(`Paciente: ${factura.paciente_id}`, 20, 45);
    doc.text(`Monto Total: $${factura.monto_total}`, 20, 55);
    doc.text(`Estado de Pago: ${factura.estado_pago}`, 20, 65);
    doc.text(`Fecha Emisión: ${factura.fecha_emision}`, 20, 75);
    doc.text(`Fecha Pago: ${factura.fecha_pago || "-"}`, 20, 85);
    doc.save(`factura_${factura.id}.pdf`);
  };

  // Utilidad para formatear fecha a dd/mm/yyyy
  const formatFecha = (fechaIso) => {
    if (!fechaIso) return "-";
    const d = new Date(fechaIso);
    if (isNaN(d)) return fechaIso;
    return d.toLocaleDateString("es-MX");
  };

  return (
    <div>
      <Box mb={2}>
        <Typography variant="h4" gutterBottom>
          Módulo de Facturación
        </Typography>
        {rol === "facturador" && (
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            color="primary"
            sx={{ mt: 2 }}
          >
            Generar factura desde procedimientos
          </Button>
        )}
        <TextField
          select
          label="Filtrar facturas"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ mt: 2, ml: 2, minWidth: 180 }}
          size="small"
        >
          <MenuItem value="pendientes">Pendientes</MenuItem>
          <MenuItem value="pagadas">Pagadas</MenuItem>
          <MenuItem value="todas">Todas</MenuItem>
        </TextField>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Paciente</TableCell>
                <TableCell>Monto Total</TableCell>
                <TableCell>Estado de Pago</TableCell>
                <TableCell>Fecha Emisión</TableCell>
                <TableCell>Fecha Pago</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas
                .filter((f) => {
                  if (filtro === "pendientes")
                    return f.estado_pago === "pendiente";
                  if (filtro === "pagadas") return f.estado_pago === "pagada";
                  return true;
                })
                .map((f) => (
                  <TableRow
                    key={f.id}
                    sx={{
                      backgroundColor:
                        f.estado_pago === "pendiente" ? "#fff3e0" : undefined,
                    }}
                  >
                    <TableCell>{f.id}</TableCell>
                    <TableCell>{f.paciente_id}</TableCell>
                    <TableCell>{f.monto_total}</TableCell>
                    <TableCell>{f.estado_pago}</TableCell>
                    <TableCell>{formatFecha(f.fecha_emision)}</TableCell>
                    <TableCell>{formatFecha(f.fecha_pago)}</TableCell>
                    <TableCell>
                      {rol === "facturador" &&
                        f.estado_pago === "pendiente" && (
                          <IconButton
                            color="success"
                            onClick={() => handleMarcarPagada(f)}
                            title="Marcar como pagada"
                          >
                            <CheckIcon />
                          </IconButton>
                        )}
                      <IconButton
                        color="primary"
                        onClick={() => handleDescargarPDF(f)}
                        title="Descargar PDF"
                      >
                        <PictureAsPdfIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Solo el facturador puede abrir el diálogo */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        /* Ocultar el diálogo si no es facturador */
        style={{ display: rol === "facturador" ? undefined : "none" }}
      >
        <DialogTitle>Generar factura desde procedimientos</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Paciente"
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {pacientes.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Odontólogo"
            value={selectedOdontologo}
            onChange={(e) => setSelectedOdontologo(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          >
            {odontologos.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.nombre}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Procedimientos pendientes"
            value={selectedProcedimientos.map((p) => p.id)}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, (option) =>
                Number(option.value)
              );
              setSelectedProcedimientos(
                procedimientosPendientes.filter((p) => values.includes(p.id))
              );
            }}
            fullWidth
            sx={{ mt: 2 }}
            SelectProps={{
              multiple: true,
              renderValue: (selected) =>
                procedimientosPendientes
                  .filter((p) => selected.includes(p.id))
                  .map((p) => `#${p.id} - ${p.fecha_realizacion}`)
                  .join(", "),
            }}
          >
            {procedimientosPendientes.map((proc) => (
              <MenuItem key={proc.id} value={proc.id}>
                #{proc.id} - {proc.fecha_realizacion} -{" "}
                {proc.notas_clinicas || "Sin notas"}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Fecha de realización"
            type="date"
            value={fechaRealizacion}
            onChange={(e) => setFechaRealizacion(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleGenerarFactura}
            variant="contained"
            disabled={
              !selectedPaciente ||
              !selectedOdontologo ||
              !fechaRealizacion ||
              selectedProcedimientos.length === 0 ||
              generando
            }
          >
            Generar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Mensaje para asistentes (no acceso) */}
      {rol === "asistente" && (
        <Box mt={4}>
          <Typography color="error">
            No tienes permisos para acceder a facturación.
          </Typography>
        </Box>
      )}
      <Snackbar
        open={alert.open}
        autoHideDuration={2000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Facturacion;
