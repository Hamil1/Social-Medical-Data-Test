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
import MuiAlert from "@mui/material/Alert";
import api from "../../services/api";

const roles = [
  { value: "administrador", label: "Administrador" },
  { value: "odontologo", label: "Odontólogo" },
  { value: "asistente", label: "Asistente" },
  { value: "facturador", label: "Facturador" },
];

const CrearUsuarioDialog = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    rol: "odontologo",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.post("/usuarios", form);
      setSuccess("Usuario creado exitosamente");
      setAlert({
        open: true,
        message: "Usuario creado exitosamente",
        severity: "success",
      });
      setForm({ nombre: "", email: "", contrasena: "", rol: "odontologo" });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Error al crear usuario. Intenta de nuevo.";
      setError(msg);
      setAlert({ open: true, message: msg, severity: "error" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Crear nuevo usuario</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <TextField
              label="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Contraseña"
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              select
              label="Rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
              required
              fullWidth
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
          <Button type="submit" variant="contained" disabled={loading}>
            Crear usuario
          </Button>
        </DialogActions>
      </form>
      <Snackbar
        open={alert.open}
        autoHideDuration={2000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
};

export default CrearUsuarioDialog;
