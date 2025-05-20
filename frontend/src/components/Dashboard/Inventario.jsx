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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import api from "../../services/api";

const InsumoSchema = Yup.object().shape({
  nombre_insumo: Yup.string().required("Requerido"),
  cantidad: Yup.number().required("Requerido").min(0),
  unidad_medida: Yup.string().required("Requerido"),
  fecha_vencimiento: Yup.string().required("Requerido"),
  costo_unitario: Yup.number().required("Requerido").min(0),
});

const EditInsumoDialog = ({ open, onClose, initialValues, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Editar Insumo</DialogTitle>
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
              label="Unidad Medida"
              name="unidad_medida"
              value={values.unidad_medida}
              onChange={handleChange}
              error={touched.unidad_medida && Boolean(errors.unidad_medida)}
              helperText={touched.unidad_medida && errors.unidad_medida}
              fullWidth
              margin="normal"
            />
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
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleEditSubmit = async (values, { setSubmitting }) => {
    try {
      await api.put(`/inventario/${values.id}`, values);
      setInsumos((prev) =>
        prev.map((i) => (i.id === values.id ? { ...i, ...values } : i))
      );
      setEditDialogOpen(false);
    } catch {
      // Manejo de error opcional
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/inventario/${id}`);
      setInsumos((prev) => prev.filter((i) => i.id !== id));
      setDeleteId(null);
    } catch {
      // Manejo de error opcional
    } finally {
      setDeleting(false);
    }
  };

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rol = usuario?.rol;

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Inventario de Insumos
      </Typography>
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
                  <TableCell>{i.fecha_vencimiento}</TableCell>
                  <TableCell>{i.costo_unitario}</TableCell>
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
          initialValues={selectedInsumo || {}}
          onSubmit={handleEditSubmit}
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
    </div>
  );
};

export default Inventario;
