import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Box,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import api from "../../services/api";

const roles = [
  { value: "administrador", label: "Administrador" },
  { value: "odontologo", label: "Odontólogo" },
  { value: "asistente", label: "Asistente" },
  { value: "facturador", label: "Facturador" },
];

const EditarUsuarioDialog = ({
  open,
  onClose,
  usuario,
  onSuccess,
  usuariosExistentes = [],
}) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  // Validación Yup
  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .required("El nombre es obligatorio"),
    email: Yup.string()
      .email("Email inválido")
      .required("El email es obligatorio")
      .test(
        "email-unico",
        "Ya existe un usuario con este email",
        function (value) {
          if (!value) return true;
          // Permitir el email actual del usuario editado
          return !usuariosExistentes.some(
            (u) => u.email === value && u.id !== usuario?.id
          );
        }
      ),
    rol: Yup.string()
      .oneOf(
        ["administrador", "odontologo", "asistente", "facturador"],
        "Rol inválido"
      )
      .required("El rol es obligatorio"),
  });

  const initialValues = {
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    rol: usuario?.rol || "odontologo",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.put(`/usuarios/${usuario.id}`, values);
      setSuccess("Usuario actualizado exitosamente");
      setAlert({
        open: true,
        message: "Usuario actualizado exitosamente",
        severity: "success",
      });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Error al actualizar usuario. Intenta de nuevo.";
      setError(msg);
      setAlert({ open: true, message: msg, severity: "error" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar usuario</DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, touched, errors, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Box display="flex" flexDirection="column" gap={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                <TextField
                  label="Nombre completo"
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  select
                  label="Rol"
                  name="rol"
                  value={values.rol}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={touched.rol && Boolean(errors.rol)}
                  helperText={touched.rol && errors.rol}
                >
                  {roles.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || isSubmitting}
              >
                Guardar cambios
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
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
    </Dialog>
  );
};

export default EditarUsuarioDialog;
