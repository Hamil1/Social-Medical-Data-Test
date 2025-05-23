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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import api from "../../services/api";
import MenuItem from "@mui/material/MenuItem";

const InsumoSchema = Yup.object().shape({
  nombre_insumo: Yup.string().required("Requerido"),
  cantidad: Yup.number().required("Requerido").min(0),
  unidad_medida: Yup.string().required("Requerido"),
  fecha_vencimiento: Yup.string().required("Requerido"),
  costo_unitario: Yup.number().required("Requerido").min(0),
});

const UNIDADES_MEDIDA = [
  "pieza",
  "caja",
  "frasco",
  "tubo",
  "paquete",
  "ml",
  "g",
  "ampolla",
  "kit",
];

const EditInsumoDialog = ({ open, onClose, initialValues, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>
      {initialValues?.id ? "Editar Insumo" : "Agregar Insumo"}
    </DialogTitle>
    <Formik
      initialValues={initialValues}
      validationSchema={InsumoSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, handleChange, touched, errors }) => (
        <Form>
          <DialogContent>
            <TextField
              label="Nombre Insumo"
              name="nombre_insumo"
              value={values.nombre_insumo}
              onChange={handleChange}
              error={touched.nombre_insumo && Boolean(errors.nombre_insumo)}
              helperText={touched.nombre_insumo && errors.nombre_insumo}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Cantidad"
              name="cantidad"
              type="number"
              value={values.cantidad}
              onChange={handleChange}
              error={touched.cantidad && Boolean(errors.cantidad)}
              helperText={touched.cantidad && errors.cantidad}
              fullWidth
              margin="normal"
            />
            <TextField
              select
              label="Unidad Medida"
              name="unidad_medida"
              value={values.unidad_medida}
              onChange={handleChange}
              error={touched.unidad_medida && Boolean(errors.unidad_medida)}
              helperText={touched.unidad_medida && errors.unidad_medida}
              fullWidth
              margin="normal"
            >
              {UNIDADES_MEDIDA.map((u) => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha de Vencimiento"
              name="fecha_vencimiento"
              type="date"
              value={values.fecha_vencimiento}
              onChange={handleChange}
              error={
                touched.fecha_vencimiento && Boolean(errors.fecha_vencimiento)
              }
              helperText={touched.fecha_vencimiento && errors.fecha_vencimiento}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Costo Unitario"
              name="costo_unitario"
              type="number"
              value={values.costo_unitario}
              onChange={handleChange}
              error={touched.costo_unitario && Boolean(errors.costo_unitario)}
              helperText={touched.costo_unitario && errors.costo_unitario}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Guardar
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
);

const Inventario = () => {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    api
      .get("/inventario")
      .then((res) => {
        setInsumos(res.data);
      })
      .catch(() => setInsumos([]))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (insumo) => {
    setSelectedInsumo(insumo);
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedInsumo(null);
    setCreateDialogOpen(true);
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const handleEditSubmit = async (values, { setSubmitting }) => {
    try {
      await api.put(`/inventario/${values.id}`, values);
      setInsumos((prev) =>
        prev.map((i) => (i.id === values.id ? { ...i, ...values } : i))
      );
      setAlert({
        open: true,
        message: "Insumo actualizado exitosamente",
        severity: "success",
      });
      setTimeout(() => setEditDialogOpen(false), 1200);
    } catch {
      setAlert({
        open: true,
        message: "Error al actualizar insumo",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const res = await api.post("/inventario", values);
      setInsumos((prev) => [...prev, res.data]);
      setAlert({
        open: true,
        message: "Insumo agregado exitosamente",
        severity: "success",
      });
      setTimeout(() => setCreateDialogOpen(false), 1200);
      resetForm();
    } catch {
      setAlert({
        open: true,
        message: "Error al agregar insumo",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/inventario/${id}`);
      setInsumos((prev) => prev.filter((i) => i.id !== id));
      setAlert({
        open: true,
        message: "Insumo eliminado exitosamente",
        severity: "success",
      });
      setTimeout(() => setDeleteId(null), 1200);
    } catch {
      setAlert({
        open: true,
        message: "Error al eliminar insumo",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Utilidad para formatear fecha a dd/mm/yyyy sin desfase de zona horaria
  const formatFecha = (fechaIso) => {
    if (!fechaIso) return "-";
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaIso)) {
      const [y, m, d] = fechaIso.split("-");
      return `${d}/${m}/${y}`;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(fechaIso)) {
      const [date] = fechaIso.split("T");
      const [y, m, d] = date.split("-");
      return `${d}/${m}/${y}`;
    }
    const d = new Date(fechaIso);
    if (isNaN(d)) return fechaIso;
    return d.toLocaleDateString("es-MX");
  };

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rol = usuario?.rol;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Inventario de Insumos
      </Typography>
      {rol !== "odontologo" && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleCreate}
        >
          Agregar insumo
        </Button>
      )}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre Insumo</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Unidad Medida</TableCell>
                <TableCell>Fecha de Vencimiento</TableCell>
                <TableCell>Costo Unitario</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumos.map((i) => (
                <TableRow
                  key={i.id}
                  sx={i.cantidad < 5 ? { backgroundColor: "#fff3e0" } : {}}
                >
                  <TableCell>{i.nombre_insumo}</TableCell>
                  <TableCell>{i.cantidad}</TableCell>
                  <TableCell>{i.unidad_medida}</TableCell>
                  <TableCell>{formatFecha(i.fecha_vencimiento)}</TableCell>
                  <TableCell>
                    {i.costo_unitario != null
                      ? Number(i.costo_unitario).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {rol !== "odontologo" && (
                      <>
                        <IconButton onClick={() => handleEdit(i)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => setDeleteId(i.id)}
                          size="small"
                          color="error"
                          disabled={deleting && deleteId === i.id}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Diálogo de edición solo para roles permitidos */}
      {rol !== "odontologo" && (
        <EditInsumoDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          initialValues={
            selectedInsumo
              ? {
                  ...selectedInsumo,
                  fecha_vencimiento: selectedInsumo.fecha_vencimiento
                    ? (() => {
                        const fv = selectedInsumo.fecha_vencimiento;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(fv)) return fv;
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(fv)) {
                          // dd/mm/yyyy -> yyyy-mm-dd
                          const [d, m, y] = fv.split("/");
                          return `${y}-${m}-${d}`;
                        }
                        if (/^\d{4}-\d{2}-\d{2}T/.test(fv)) {
                          // yyyy-mm-ddTHH:mm:ssZ -> yyyy-mm-dd
                          return fv.split("T")[0];
                        }
                        // fallback: intentar parsear como Date
                        const d = new Date(fv);
                        if (!isNaN(d)) {
                          return d.toISOString().slice(0, 10);
                        }
                        return "";
                      })()
                    : "",
                }
              : {}
          }
          onSubmit={handleEditSubmit}
        />
      )}
      {rol !== "odontologo" && (
        <EditInsumoDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          initialValues={{
            nombre_insumo: "",
            cantidad: 0,
            unidad_medida: "",
            fecha_vencimiento: "",
            costo_unitario: 0,
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
      {/* Diálogo de eliminación solo para roles permitidos */}
      {rol !== "odontologo" && (
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>¿Eliminar insumo?</DialogTitle>
          <DialogContent>Esta acción no se puede deshacer.</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button
              onClick={() => handleDelete(deleteId)}
              color="error"
              variant="contained"
              disabled={deleting}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Mensaje para odontólogo (solo visualización) */}
      {rol === "odontologo" && (
        <Box mt={3}>
          <Typography color="info.main">
            Solo puedes visualizar el inventario. Para gestionar insumos,
            contacta a un asistente o administrador.
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

export default Inventario;
