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

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editPaciente, setEditPaciente] = useState(null);

  useEffect(() => {
    fetchPacientes();
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

  const handleDialogSubmit = async (values, { setSubmitting }) => {
    try {
      if (editPaciente) {
        await api.put(`/pacientes/${editPaciente.id}`, values);
      } else {
        await api.post("/pacientes", values);
      }
      fetchPacientes();
      setOpenDialog(false);
    } catch (e) {
      // Manejo de error opcional
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
          }
        }
      />
    </div>
  );
};

export default Pacientes;
