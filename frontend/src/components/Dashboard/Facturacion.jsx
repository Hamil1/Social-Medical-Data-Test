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
  Checkbox,
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
  const [allProcedimientos, setAllProcedimientos] = useState([]); // Nuevo estado para todos los procedimientos

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

  // Cambiar: fetch de procedimientos solo al abrir el modal
  useEffect(() => {
    if (openDialog) {
      api.get("/consultas-procedimientos").then((res) => {
        setAllProcedimientos(res.data);
      });
    } else {
      setAllProcedimientos([]);
    }
  }, [openDialog]);

  // Filtrar procedimientos pendientes según selección
  useEffect(() => {
    if (selectedPaciente && selectedOdontologo) {
      // Ahora compara como number, ya que los selects guardan number
      const pendientes = allProcedimientos.filter(
        (c) =>
          c.paciente_id === selectedPaciente &&
          c.odontologo_id === selectedOdontologo &&
          !c.factura_id
      );
      setProcedimientosPendientes(pendientes);
      setSelectedProcedimientos([]);
    } else {
      setProcedimientosPendientes([]);
      setSelectedProcedimientos([]);
    }
  }, [selectedPaciente, selectedOdontologo, allProcedimientos]);

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

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPaciente("");
    setSelectedOdontologo("");
    setSelectedProcedimiento("");
    setFechaRealizacion(new Date().toISOString().slice(0, 10));
    setSelectedProcedimientos([]);
    setAllProcedimientos([]);
  };

  const handleOpenDialog = () => setOpenDialog(true); // Agrega la función handleOpenDialog para abrir el modal

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
  const handleDescargarPDF = async (factura) => {
    try {
      // 1. Obtener todos los procedimientos asociados a la factura
      const procedimientosRes = await api.get("/consultas-procedimientos");
      const allProcedimientos = Array.isArray(procedimientosRes.data)
        ? procedimientosRes.data
        : procedimientosRes.data.consultas || [];
      const procedimientosFactura = allProcedimientos.filter(
        (p) => p.factura_id === factura.id
      );

      // 2. Obtener catálogo de procedimientos, pacientes y odontólogos para mostrar nombres
      const [procedimientosCatalogoRes, pacientesRes, usuariosRes] =
        await Promise.all([
          api.get("/procedimientos"),
          api.get("/pacientes"),
          api.get("/usuarios"),
        ]);
      const procedimientosCatalogo = procedimientosCatalogoRes.data;
      const pacientes = pacientesRes.data;
      const usuarios = usuariosRes.data;
      const paciente = pacientes.find((p) => p.id === factura.paciente_id);
      // Buscar odontólogo de los procedimientos (toma el primero, asume que todos son del mismo doctor en la factura)
      let odontologo = null;
      if (procedimientosFactura.length > 0) {
        odontologo = usuarios.find(
          (u) => u.id === procedimientosFactura[0].odontologo_id
        );
      }

      // 3. Crear PDF con diseño profesional
      const doc = new jsPDF();
      // Colores y estilos
      const azul = [44, 62, 80];
      const gris = [236, 240, 241];
      const acento = [52, 152, 219];
      // Encabezado con logo y título
      doc.setFillColor(...azul);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont(undefined, "bold");
      doc.text("Factura Odontológica", 105, 18, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("social-medical-data", 105, 26, { align: "center" });
      doc.setFont(undefined, "normal");
      doc.setTextColor(44, 62, 80);
      let y = 38;
      // Info general
      doc.setFontSize(12);
      doc.text(`ID: ${factura.id}`, 20, y);
      doc.text(
        `Paciente: ${paciente ? paciente.nombre : factura.paciente_id}`,
        20,
        (y += 8)
      );
      doc.text(`Doctor: ${odontologo ? odontologo.nombre : "-"}`, 20, (y += 8));
      // Formato de fecha
      const formatFecha = (fechaIso) => {
        if (!fechaIso) return "-";
        // Si viene en formato YYYY-MM-DD, formatear manualmente para evitar desfase
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
          const [y, m, d] = fechaIso.split("-");
          return `${d}/${m}/${y}`;
        }
        // Si viene en formato ISO completo, intentar extraer la parte de fecha
        if (/^\d{4}-\d{2}-\d{2}T/.test(fechaIso)) {
          const [date] = fechaIso.split("T");
          const [y, m, d] = date.split("-");
          return `${d}/${m}/${y}`;
        }
        // Si no, intentar parsear como Date (fallback)
        const d = new Date(fechaIso);
        if (isNaN(d)) return fechaIso;
        return d.toLocaleDateString("es-MX");
      };
      doc.text(
        `Fecha Emisión: ${formatFecha(factura.fecha_emision)}`,
        20,
        (y += 8)
      );
      doc.text(
        `Fecha Pago: ${
          factura.fecha_pago ? formatFecha(factura.fecha_pago) : "-"
        }`,
        20,
        (y += 8)
      );
      doc.text(`Estado de Pago: ${factura.estado_pago}`, 20, (y += 8));
      y += 8;
      // Línea divisoria
      doc.setDrawColor(...acento);
      doc.setLineWidth(1);
      doc.line(20, y, 190, y);
      y += 10;
      // Tabla de procedimientos
      doc.setFontSize(14);
      doc.setTextColor(...acento);
      doc.text("Procedimientos", 105, y, { align: "center" });
      y += 8;
      doc.setFontSize(11);
      doc.setTextColor(44, 62, 80);
      // Encabezados de tabla
      const headers = ["Nombre", "Fecha", "Precio", "Notas clínicas"];
      const colWidths = [50, 30, 25, 70];
      let x = 20;
      headers.forEach((h, i) => {
        doc.setFillColor(...gris);
        doc.rect(x, y, colWidths[i], 9, "F");
        doc.setFont(undefined, "bold");
        doc.setTextColor(...acento);
        doc.text(h, x + 2, y + 7);
        doc.setFont(undefined, "normal");
        doc.setTextColor(44, 62, 80);
        x += colWidths[i];
      });
      y += 11;
      // Filas de procedimientos
      let total = 0;
      procedimientosFactura.forEach((proc, idx) => {
        const procCat = procedimientosCatalogo.find(
          (p) => p.id === proc.procedimiento_id
        );
        const nombre = procCat ? procCat.nombre : proc.procedimiento_id;
        const fecha = proc.fecha_realizacion
          ? formatFecha(proc.fecha_realizacion)
          : "-";
        const precio =
          procCat && procCat.precio != null
            ? Number(procCat.precio)
            : proc.precio != null
            ? Number(proc.precio)
            : 0;
        total += precio;
        const precioStr =
          precio > 0
            ? `$${precio.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-";
        // Notas clínicas: wrap automático usando splitTextToSize
        const notas = proc.notas_clinicas || "-";
        const notasLines = doc.splitTextToSize(notas, colWidths[3] - 4);
        // Calcular el alto de la celda de notas clínicas (mínimo 9)
        const cellHeight = Math.max(9, 9 * notasLines.length);
        // Alternar color de fondo para filas
        if (idx % 2 === 1) {
          doc.setFillColor(245, 245, 250);
          doc.rect(20, y, 175, cellHeight, "F");
        }
        // Celdas alineadas verticalmente al centro de la celda de notas
        let x = 20;
        const centerY = y + cellHeight / 2 + 0.5; // +0.5 para mejor alineación visual
        [nombre, fecha, precioStr].forEach((cell, i) => {
          doc.setTextColor(44, 62, 80);
          doc.text(String(cell), x + 2, centerY, { baseline: "middle" });
          x += colWidths[i];
        });
        // Notas clínicas multilinea con wrap
        x = 20 + colWidths[0] + colWidths[1] + colWidths[2];
        // Calcular el alto total del bloque de notas clínicas
        const notasBlockHeight = 9 * notasLines.length;
        // Calcular el offset para centrar el bloque de notas dentro de la celda
        const notasStartY = y + (cellHeight - notasBlockHeight) / 2 + 7 - 7; // +7-7 para mantener alineación con otras celdas
        notasLines.forEach((line, j) => {
          doc.text(String(line), x + 2, notasStartY + j * 9);
        });
        y += cellHeight;
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
      });
      // Total al final, destacado
      y += 6;
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.setTextColor(...acento);
      doc.text(
        `TOTAL: $${total.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        190,
        y,
        { align: "right" }
      );
      doc.setFont(undefined, "normal");
      // Pie de página elegante
      doc.setFontSize(10);
      doc.setTextColor(180, 180, 180);
      doc.text(
        `Generado el ${new Date().toLocaleDateString(
          "es-MX"
        )} - social-medical-data`,
        105,
        290,
        { align: "center" }
      );
      doc.save(`factura_${factura.id}.pdf`);
    } catch (err) {
      alert("Error generando PDF: " + (err?.message || err));
    }
  };

  // Utilidad para formatear fecha a dd/mm/yyyy sin desfase de zona horaria
  const formatFecha = (fechaIso) => {
    if (!fechaIso) return "-";
    // Si viene en formato YYYY-MM-DD, formatear manualmente para evitar desfase
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
      const [y, m, d] = fechaIso.split("-");
      return `${d}/${m}/${y}`;
    }
    // Si viene en formato ISO completo, intentar extraer la parte de fecha
    if (/^\d{4}-\d{2}-\d{2}T/.test(fechaIso)) {
      const [date] = fechaIso.split("T");
      const [y, m, d] = date.split("-");
      return `${d}/${m}/${y}`;
    }
    // Si no, intentar parsear como Date (fallback)
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
        {(rol === "facturador" || rol === "administrador") && (
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
                    <TableCell>
                      {f.monto_total != null
                        ? Number(f.monto_total).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>{f.estado_pago}</TableCell>
                    <TableCell>{formatFecha(f.fecha_emision)}</TableCell>
                    <TableCell>{formatFecha(f.fecha_pago)}</TableCell>
                    <TableCell>
                      {(rol === "facturador" || rol === "administrador") &&
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
        // El modal debe mostrarse para facturador o administrador
        style={{
          display:
            rol === "facturador" || rol === "administrador"
              ? undefined
              : "none",
        }}
      >
        <DialogTitle>Generar factura desde procedimientos</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Paciente"
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(Number(e.target.value))}
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
            onChange={(e) => setSelectedOdontologo(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          >
            {odontologos.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.nombre}
              </MenuItem>
            ))}
          </TextField>
          {/* Tabla de procedimientos pendientes con checkboxes */}
          {selectedPaciente &&
            selectedOdontologo &&
            (procedimientosPendientes.length > 0 ? (
              <>
                <TableContainer
                  component={Paper}
                  sx={{
                    mt: 2,
                    mb: 0,
                    boxShadow: 3,
                    maxHeight: procedimientosPendientes.length > 5 ? 360 : 260, // Más alto si hay muchos
                    minHeight: 120, // Siempre se ve como tabla, aunque haya pocos
                    maxWidth: "100%",
                    overflowX: "auto",
                    overflowY: "auto",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#e3e6f0" }}>
                        <TableCell
                          padding="checkbox"
                          sx={{
                            backgroundColor: "#e3e6f0",
                            fontWeight: "bold",
                          }}
                        >
                          <Checkbox
                            color="primary"
                            indeterminate={
                              selectedProcedimientos.length > 0 &&
                              selectedProcedimientos.length <
                                procedimientosPendientes.length
                            }
                            checked={
                              procedimientosPendientes.length > 0 &&
                              selectedProcedimientos.length ===
                                procedimientosPendientes.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProcedimientos([
                                  ...procedimientosPendientes,
                                ]);
                              } else {
                                setSelectedProcedimientos([]);
                              }
                            }}
                            inputProps={{ "aria-label": "Seleccionar todos" }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#e3e6f0",
                            fontWeight: "bold",
                          }}
                        >
                          ID
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#e3e6f0",
                            fontWeight: "bold",
                          }}
                        >
                          Fecha
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: "#e3e6f0",
                            fontWeight: "bold",
                          }}
                        >
                          Notas clínicas
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            backgroundColor: "#e3e6f0",
                            fontWeight: "bold",
                          }}
                        >
                          Precio
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {procedimientosPendientes.map((proc) => {
                        const isSelected = selectedProcedimientos.some(
                          (p) => p.id === proc.id
                        );
                        return (
                          <TableRow
                            key={proc.id}
                            hover
                            selected={isSelected}
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedProcedimientos(
                                  selectedProcedimientos.filter(
                                    (p) => p.id !== proc.id
                                  )
                                );
                              } else {
                                setSelectedProcedimientos([
                                  ...selectedProcedimientos,
                                  proc,
                                ]);
                              }
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setSelectedProcedimientos(
                                      selectedProcedimientos.filter(
                                        (p) => p.id !== proc.id
                                      )
                                    );
                                  } else {
                                    setSelectedProcedimientos([
                                      ...selectedProcedimientos,
                                      proc,
                                    ]);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TableCell>
                            <TableCell>{proc.id}</TableCell>
                            <TableCell>
                              {proc.fecha_realizacion
                                ? new Date(
                                    proc.fecha_realizacion
                                  ).toLocaleString("es-MX", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </TableCell>
                            <TableCell
                              style={{
                                maxWidth: 180,
                                whiteSpace: "pre-line",
                                wordBreak: "break-word",
                              }}
                            >
                              {proc.notas_clinicas || (
                                <span style={{ color: "#888" }}>Sin notas</span>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <b>
                                {proc.precio != null
                                  ? Number(proc.precio).toLocaleString(
                                      "es-DO",
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )
                                  : "-"}
                              </b>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Contador de procedimientos */}
                <Box sx={{ textAlign: "right", mt: 0.5, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {procedimientosPendientes.length} procedimiento
                    {procedimientosPendientes.length !== 1 ? "s" : ""} pendiente
                    {procedimientosPendientes.length !== 1 ? "s" : ""}
                  </Typography>
                </Box>
                {/* Total fuera de la tabla y siempre visible, con sticky en el modal */}
                <Box
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    p: 2,
                    background: "#f5f5f5",
                    borderTop: "1px solid #e0e0e0",
                    textAlign: "right",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    Total:{" "}
                    {selectedProcedimientos
                      .reduce((sum, p) => sum + Number(p.precio || 0), 0)
                      .toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography color="text.secondary" align="center">
                  No hay procedimientos pendientes para este paciente y
                  odontólogo.
                </Typography>
              </Box>
            ))}
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
