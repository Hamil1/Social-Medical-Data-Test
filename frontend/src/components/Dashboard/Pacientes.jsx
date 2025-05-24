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
import PacienteFormDialog from "./PacienteFormDialog";
import api from "../../services/api";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPaciente, setEditPaciente] = useState(null);
  const [odontologos, setOdontologos] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPacientes();
    api.get("/usuarios").then((res) => {
      setOdontologos(res.data.filter((u) => u.rol === "odontologo"));
    });
  }, []);

  const fetchPacientes = () => {
    setLoading(true);
    api
      .get("/pacientes")
      .then((res) => {
        setPacientes(res.data);
      })
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false));
  };

  const handleCreate = () => {
    setEditPaciente(null);
    setOpenDialog(true);
  };

  const handleEdit = (paciente) => {
    setEditPaciente(paciente);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditPaciente(null);
  };

  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const handleDialogSubmit = async (values, { setSubmitting }) => {
    try {
      // Mapear historial -> historial_clinico y enviar null si está vacío
      const payload = {
        ...values,
        historial_clinico: values.historial?.trim() ? values.historial : null,
      };
      delete payload.historial;
      if (editPaciente) {
        await api.put(`/pacientes/${editPaciente.id}`, payload);
        setAlert({
          open: true,
          message: "Paciente actualizado exitosamente",
          severity: "success",
        });
      } else {
        await api.post("/pacientes", payload);
        setAlert({
          open: true,
          message: "Paciente creado exitosamente",
          severity: "success",
        });
      }
      fetchPacientes();
      setTimeout(() => setOpenDialog(false), 1200);
    } catch {
      setAlert({
        open: true,
        message: "Error al guardar paciente",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Gestión de Pacientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          color="primary"
        >
          Crear nuevo paciente
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
                <TableCell>Documento</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pacientes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{p.documento_identidad}</TableCell>
                  <TableCell>{p.telefono}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.direccion}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(p)} size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <PacienteFormDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialValues={
          editPaciente || {
            nombre: "",
            documento_identidad: "",
            telefono: "",
            email: "",
            direccion: "",
            historial: "",
            odontologo_id: "",
          }
        }
        odontologos={odontologos}
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

export default Pacientes;
