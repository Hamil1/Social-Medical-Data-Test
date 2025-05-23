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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CrearUsuarioDialog from "./CrearUsuarioDialog";
import EditarUsuarioDialog from "./EditarUsuarioDialog";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const fetchUsuarios = () => {
    setLoading(true);
    api
      .get("/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setAlert({
        open: true,
        message: "Usuario eliminado exitosamente",
        severity: "success",
      });
      fetchUsuarios();
    } catch {
      setAlert({
        open: true,
        message: "Error al eliminar usuario",
        severity: "error",
      });
    }
  };

  const handleEdit = (user) => {
    setUsuarioEditar(user);
  };

  const handleCreateSuccess = () => {
    fetchUsuarios();
    setAlert({
      open: true,
      message: "Usuario creado exitosamente",
      severity: "success",
    });
  };

  return (
    <div>
      <Box>
        <Typography variant="h4" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          color="primary"
        >
          Crear nuevo usuario
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                {usuario?.rol === "administrador" && (
                  <TableCell>Acciones</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nombre}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.rol}</TableCell>
                  {usuario?.rol === "administrador" && (
                    <TableCell>
                      <IconButton
                        onClick={() => handleEdit(u)}
                        size="small"
                        color="primary"
                        title="Editar usuario"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(u.id)}
                        size="small"
                        color="error"
                        title="Eliminar usuario"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <CrearUsuarioDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={handleCreateSuccess}
      />
      <EditarUsuarioDialog
        open={!!usuarioEditar}
        onClose={() => setUsuarioEditar(null)}
        usuario={usuarioEditar}
        usuariosExistentes={usuarios}
        onSuccess={fetchUsuarios}
      />
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

export default Usuarios;
