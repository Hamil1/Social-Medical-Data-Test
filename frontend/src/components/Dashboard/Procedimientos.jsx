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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const ProcedimientoSchema = Yup.object().shape({
  nombre: Yup.string().required("Nombre requerido"),
  precio: Yup.number().required("Precio requerido").min(0),
  descripcion: Yup.string().required("Descripción requerida"),
  insumos_necesarios: Yup.string(), // Puede ser un campo de texto separado por comas
});

const RegistroProcedimientoDialog = ({ open, onClose, onSubmit }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Registrar Procedimiento</DialogTitle>
    <Formik
      initialValues={{
        nombre: "",
        precio: "",
        descripcion: "",
        insumos_necesarios: "",
      }}
      validationSchema={ProcedimientoSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, touched, errors }) => (
        <Form>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre"
                name="nombre"
                value={values.nombre}
                onChange={handleChange}
                error={touched.nombre && Boolean(errors.nombre)}
                helperText={touched.nombre && errors.nombre}
                fullWidth
              />
              <TextField
                label="Precio"
                name="precio"
                type="number"
                value={values.precio}
                onChange={handleChange}
                error={touched.precio && Boolean(errors.precio)}
                helperText={touched.precio && errors.precio}
                fullWidth
              />
              <TextField
                label="Descripción"
                name="descripcion"
                value={values.descripcion}
                onChange={handleChange}
                error={touched.descripcion && Boolean(errors.descripcion)}
                helperText={touched.descripcion && errors.descripcion}
                fullWidth
              />
              <TextField
                label="Insumos necesarios (separados por coma)"
                name="insumos_necesarios"
                value={values.insumos_necesarios}
                onChange={handleChange}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Confirmar y guardar
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
);

const RegistroProcedimientoPacienteSchema = Yup.object().shape({
  paciente_id: Yup.string().required("Selecciona un paciente"),
  procedimiento_id: Yup.string().required("Selecciona un procedimiento"),
  odontologo_id: Yup.string().required("Selecciona un odontólogo"),
  notas_clinicas: Yup.string(),
});

const RegistroProcedimientoPacienteDialog = ({
  open,
  onClose,
  onSubmit,
  pacientes,
  procedimientos,
  odontologos,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Registrar Procedimiento para Paciente</DialogTitle>
    <Formik
      initialValues={{
        paciente_id: "",
        procedimiento_id: "",
        odontologo_id: "",
        notas_clinicas: "",
        fecha_realizacion: new Date().toISOString().slice(0, 10),
      }}
      validationSchema={RegistroProcedimientoPacienteSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, touched, errors }) => (
        <Form>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                select
                label="Paciente"
                name="paciente_id"
                value={values.paciente_id}
                onChange={handleChange}
                error={touched.paciente_id && Boolean(errors.paciente_id)}
                helperText={touched.paciente_id && errors.paciente_id}
                fullWidth
              >
                {pacientes.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Procedimiento"
                name="procedimiento_id"
                value={values.procedimiento_id}
                onChange={handleChange}
                error={
                  touched.procedimiento_id && Boolean(errors.procedimiento_id)
                }
                helperText={touched.procedimiento_id && errors.procedimiento_id}
                fullWidth
              >
                {procedimientos.map((proc) => (
                  <MenuItem key={proc.id} value={proc.id}>
                    {proc.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Odontólogo"
                name="odontologo_id"
                value={values.odontologo_id}
                onChange={handleChange}
                error={touched.odontologo_id && Boolean(errors.odontologo_id)}
                helperText={touched.odontologo_id && errors.odontologo_id}
                fullWidth
              >
                {odontologos.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notas clínicas"
                name="notas_clinicas"
                value={values.notas_clinicas}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Fecha de realización"
                name="fecha_realizacion"
                type="date"
                value={values.fecha_realizacion}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Confirmar y guardar
            </Button>
          </DialogActions>
        </Form>
      )}
    </Formik>
  </Dialog>
);

const Procedimientos = () => {
  const [procedimientos, setProcedimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogPaciente, setOpenDialogPaciente] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [procedimientosList, setProcedimientosList] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [tab, setTab] = useState(0);
  const [consultasProcedimientos, setConsultasProcedimientos] = useState([]);
  const [filtroEstatus, setFiltroEstatus] = useState("todos");

  useEffect(() => {
    api
      .get("/procedimientos")
      .then((res) => setProcedimientos(res.data))
      .catch(() => setProcedimientos([]))
      .finally(() => setLoading(false));
    api.get("/pacientes").then((res) => setPacientes(res.data));
    api.get("/procedimientos").then((res) => setProcedimientosList(res.data));
    api
      .get("/usuarios")
      .then((res) =>
        setOdontologos(res.data.filter((u) => u.rol === "odontologo"))
      );
    api
      .get("/consultas-procedimientos")
      .then((res) => setConsultasProcedimientos(res.data));
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const valuesWithFecha = {
        ...values,
        fecha_realizacion: new Date().toISOString().slice(0, 10),
      };
      await api.post("/consultas-procedimientos", valuesWithFecha);
      setOpenDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Box mb={2}>
        <Typography variant="h4" gutterBottom>
          Registro de Procedimientos
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Catálogo de procedimientos" />
          <Tab label="Procedimientos realizados a pacientes" />
        </Tabs>
        {tab === 0 && (
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              color="primary"
              sx={{ mt: 2, mr: 2 }}
            >
              Registrar procedimiento (catálogo)
            </Button>
            {loading ? (
              <CircularProgress />
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Descripción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {procedimientos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nombre}</TableCell>
                        <TableCell>{p.precio}</TableCell>
                        <TableCell>{p.descripcion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <Button
              variant="outlined"
              onClick={() => setOpenDialogPaciente(true)}
              color="secondary"
              sx={{ mb: 2 }}
            >
              Registrar procedimiento para paciente
            </Button>
            <Box mb={2}>
              <TextField
                select
                label="Filtrar por estatus"
                value={filtroEstatus}
                onChange={(e) => setFiltroEstatus(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="pendiente">Pendientes</MenuItem>
                <MenuItem value="facturado">Facturados</MenuItem>
                <MenuItem value="pagado">Pagados</MenuItem>
              </TextField>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Procedimiento</TableCell>
                    <TableCell>Odontólogo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Notas clínicas</TableCell>
                    <TableCell>Estatus</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consultasProcedimientos
                    .filter((c) => {
                      const estatus =
                        c.estatus ||
                        (c.factura_id
                          ? c.estatus === "pagado"
                            ? "pagado"
                            : "facturado"
                          : "pendiente");
                      if (filtroEstatus === "todos") return true;
                      return estatus === filtroEstatus;
                    })
                    .map((c) => {
                      const paciente = pacientes.find(
                        (p) => p.id === c.paciente_id
                      );
                      const proc = procedimientosList.find(
                        (p) => p.id === c.procedimiento_id
                      );
                      const odontologo = odontologos.find(
                        (o) => o.id === c.odontologo_id
                      );
                      const estatus =
                        c.estatus ||
                        (c.factura_id
                          ? c.estatus === "pagado"
                            ? "pagado"
                            : "facturado"
                          : "pendiente");
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            {paciente ? paciente.nombre : c.paciente_id}
                          </TableCell>
                          <TableCell>
                            {proc ? proc.nombre : c.procedimiento_id}
                          </TableCell>
                          <TableCell>
                            {odontologo ? odontologo.nombre : c.odontologo_id}
                          </TableCell>
                          <TableCell>{c.fecha_realizacion}</TableCell>
                          <TableCell>{c.notas_clinicas || "-"}</TableCell>
                          <TableCell>{estatus}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
      <RegistroProcedimientoDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      />
      <RegistroProcedimientoPacienteDialog
        open={openDialogPaciente}
        onClose={() => setOpenDialogPaciente(false)}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await api.post("/consultas-procedimientos", {
              ...values,
              paciente_id: Number(values.paciente_id),
              procedimiento_id: Number(values.procedimiento_id),
              odontologo_id: Number(values.odontologo_id),
              fecha_realizacion: values.fecha_realizacion,
            });
            setOpenDialogPaciente(false);
          } finally {
            setSubmitting(false);
          }
        }}
        pacientes={pacientes}
        procedimientos={procedimientosList}
        odontologos={odontologos}
      />
    </div>
  );
};

export default Procedimientos;
