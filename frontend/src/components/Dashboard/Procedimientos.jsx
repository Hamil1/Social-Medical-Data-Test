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
  Snackbar,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../services/api";
import { useFormikContext, Formik, Form } from "formik";
import * as Yup from "yup";

const ProcedimientoSchema = Yup.object().shape({
  nombre: Yup.string().required("Nombre requerido"),
  precio: Yup.number().required("Precio requerido").min(0),
  descripcion: Yup.string().required("Descripción requerida"),
  insumos_necesarios: Yup.array().of(
    Yup.object({
      id: Yup.number().required(),
      nombre_insumo: Yup.string().required(),
    })
  ),
});

const RegistroProcedimientoDialog = ({ open, onClose, onSubmit, insumos }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Registrar Procedimiento</DialogTitle>
    <Formik
      initialValues={{
        nombre: "",
        precio: "",
        descripcion: "",
        insumos_necesarios: [],
      }}
      validationSchema={ProcedimientoSchema}
      onSubmit={onSubmit}
    >
      {({ values, handleChange, setFieldValue, touched, errors }) => (
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
              <Autocomplete
                multiple
                options={insumos}
                getOptionLabel={(option) => option.nombre_insumo}
                value={values.insumos_necesarios}
                onChange={(_, value) =>
                  setFieldValue("insumos_necesarios", value)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Insumos necesarios"
                    placeholder="Selecciona insumos"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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

function InsumosSync({
  procedimientos,
  inventario,
  setInsumosSeleccionados,
  setCantidadErrores,
}) {
  const { values } = useFormikContext();

  React.useEffect(() => {
    if (!values.procedimiento_id) {
      setInsumosSeleccionados([]);
      setCantidadErrores({});
      return;
    }
    const proc = procedimientos.find(
      (p) => String(p.id) === String(values.procedimiento_id)
    );
    let insumos = [];
    if (proc && proc.insumos_necesarios) {
      if (Array.isArray(proc.insumos_necesarios)) {
        insumos = proc.insumos_necesarios;
      } else if (typeof proc.insumos_necesarios === "string") {
        insumos = proc.insumos_necesarios
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
          .map(
            (nombre) =>
              inventario.find((i) => i.nombre_insumo === nombre) || {
                nombre_insumo: nombre,
              }
          );
      }
      setInsumosSeleccionados((prev) => {
        // Mantén la cantidad previa si existe, si no pon 1
        return insumos.map((i) => {
          const previo = prev.find(
            (p) => p.id === i.id || p.nombre_insumo === i.nombre_insumo
          );
          return {
            ...i,
            cantidad_utilizada: previo?.cantidad_utilizada ?? 1,
          };
        });
      });
      setCantidadErrores({});
    } else {
      setInsumosSeleccionados([]);
      setCantidadErrores({});
    }
  }, [values.procedimiento_id, procedimientos, inventario]);
  return null;
}

const RegistroProcedimientoPacienteDialog = ({
  open,
  onClose,
  onSubmit,
  pacientes,
  procedimientos,
  odontologos,
  inventario = [],
}) => {
  const [insumosSeleccionados, setInsumosSeleccionados] = React.useState([]);
  const [cantidadErrores, setCantidadErrores] = React.useState({});

  // Validación de cantidades
  const validarCantidad = (idx, cantidad) => {
    const insumo = insumosSeleccionados[idx];
    const inventarioInsumo = inventario.find((i) => i.id === insumo.id);
    if (inventarioInsumo && cantidad > inventarioInsumo.cantidad_disponible) {
      setCantidadErrores((prev) => ({ ...prev, [idx]: true }));
    } else {
      setCantidadErrores((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const algunaCantidadInvalida = Object.values(cantidadErrores).some(Boolean);

  return (
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
        enableReinitialize
        validationSchema={RegistroProcedimientoPacienteSchema}
        onSubmit={(values, formikHelpers) => {
          onSubmit(
            {
              ...values,
              insumos_utilizados: insumosSeleccionados.map((i) => ({
                insumo_id: i.id,
                cantidad_utilizada: i.cantidad_utilizada,
              })),
            },
            formikHelpers
          );
        }}
      >
        {({ values, handleChange, touched, errors, setFieldValue }) => (
          <Form>
            <InsumosSync
              procedimientos={procedimientos}
              inventario={inventario}
              setInsumosSeleccionados={setInsumosSeleccionados}
              setCantidadErrores={setCantidadErrores}
            />
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
                  helperText={
                    touched.procedimiento_id && errors.procedimiento_id
                  }
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
                {insumosSeleccionados.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Insumos utilizados:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: "#f5f7fa",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                        mb: 2,
                      }}
                    >
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Insumo
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Cantidad
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Stock disponible
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {insumosSeleccionados.map((insumo, idx) => {
                              const inventarioInsumo = inventario.find(
                                (i) => i.id === insumo.id
                              );
                              // Usar cantidad_disponible si existe, si no cantidad
                              let stockOriginal = "-";
                              if (inventarioInsumo) {
                                if (
                                  typeof inventarioInsumo.cantidad_disponible !==
                                  "undefined"
                                ) {
                                  stockOriginal = Number(
                                    inventarioInsumo.cantidad_disponible
                                  );
                                } else if (
                                  typeof inventarioInsumo.cantidad !==
                                  "undefined"
                                ) {
                                  stockOriginal = Number(
                                    inventarioInsumo.cantidad
                                  );
                                }
                              }
                              const cantidadUtilizada =
                                Number(insumo.cantidad_utilizada) || 0;
                              const stock =
                                stockOriginal !== "-" && !isNaN(stockOriginal)
                                  ? Math.max(
                                      stockOriginal - cantidadUtilizada,
                                      0
                                    )
                                  : 0;
                              return (
                                <TableRow
                                  key={insumo.id || insumo.nombre_insumo}
                                >
                                  <TableCell align="center">
                                    {insumo.nombre_insumo}
                                  </TableCell>
                                  <TableCell align="center">
                                    <TextField
                                      type="number"
                                      size="small"
                                      value={insumo.cantidad_utilizada}
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (isNaN(value) || value < 1) return; // Evita valores inválidos
                                        const nuevaLista = [
                                          ...insumosSeleccionados,
                                        ];
                                        nuevaLista[idx] = {
                                          ...nuevaLista[idx],
                                          cantidad_utilizada: value,
                                        };
                                        setInsumosSeleccionados(nuevaLista);
                                        validarCantidad(idx, value);
                                      }}
                                      inputProps={{
                                        min: 1,
                                        max:
                                          stockOriginal !== "-"
                                            ? stockOriginal
                                            : undefined,
                                        style: { textAlign: "center" },
                                        step: 1, // Asegura que las flechas sumen/restan de a 1
                                      }}
                                      sx={{
                                        width: 80,
                                        backgroundColor: "#fff",
                                        borderRadius: 1,
                                      }}
                                      error={!!cantidadErrores[idx]}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      sx={{
                                        fontWeight:
                                          stock < 5 ? "bold" : "normal",
                                        color:
                                          stock < 5 ? "#d32f2f" : "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {typeof stock === "number" &&
                                      !isNaN(stock)
                                        ? stock + 1
                                        : 0}
                                      {stock < 5 && (
                                        <span
                                          style={{
                                            marginLeft: 6,
                                            fontSize: 18,
                                          }}
                                          title="Stock crítico"
                                        >
                                          ⚠️
                                        </span>
                                      )}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={algunaCantidadInvalida}
              >
                Confirmar y guardar
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

const EditarProcedimientoDialog = ({
  open,
  onClose,
  procedimiento,
  insumos,
  onSubmit,
}) => {
  // Guard clause: if no procedimiento, do not render dialog
  if (!procedimiento) return null;

  const initialValues = {
    ...procedimiento,
    insumos_necesarios:
      procedimiento.insumos_necesarios &&
      procedimiento.insumos_necesarios.length > 0
        ? procedimiento.insumos_necesarios.trim().startsWith("[")
          ? JSON.parse(procedimiento.insumos_necesarios)
          : procedimiento.insumos_necesarios
              .split(",")
              .map((n) => insumos.find((i) => i.nombre_insumo === n.trim()))
              .filter(Boolean)
        : [],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Procedimiento</DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={ProcedimientoSchema}
        onSubmit={onSubmit}
      >
        {({ values, handleChange, setFieldValue, touched, errors }) => (
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
                <Autocomplete
                  multiple
                  options={insumos}
                  getOptionLabel={(option) => option.nombre_insumo}
                  value={values.insumos_necesarios}
                  onChange={(_, value) =>
                    setFieldValue("insumos_necesarios", value)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Insumos necesarios"
                      placeholder="Selecciona insumos"
                    />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Guardar cambios
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

// Diálogo para editar procedimiento realizado a paciente
const EditarConsultaProcedimientoDialog = ({
  open,
  onClose,
  consulta,
  pacientes,
  procedimientos,
  odontologos,
  onSubmit,
  inventario = [], // <-- PASA EL INVENTARIO GLOBAL
}) => {
  const [insumosSeleccionados, setInsumosSeleccionados] = React.useState([]);
  const [cantidadErrores, setCantidadErrores] = React.useState({});
  const [inventarioEdicion, setInventarioEdicion] = useState([]);

  // Utilidad para comparar arrays de insumos
  function insumosIguales(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].id !== b[i].id ||
        a[i].nombre_insumo !== b[i].nombre_insumo ||
        a[i].cantidad_utilizada !== b[i].cantidad_utilizada
      ) {
        return false;
      }
    }
    return true;
  }

  // Inicializa insumosSeleccionados al abrir el modal o cambiar consulta
  React.useEffect(() => {
    if (!open || !consulta) return;
    let nuevosInsumos = [];
    if (
      consulta.insumos_utilizados &&
      Array.isArray(consulta.insumos_utilizados)
    ) {
      nuevosInsumos = consulta.insumos_utilizados.map((iu) => {
        const inv = inventario.find((i) => i.id === iu.insumo_id);
        return {
          id: iu.insumo_id,
          nombre_insumo: inv
            ? inv.nombre_insumo
            : iu.nombre_insumo || iu.insumo_id,
          cantidad_utilizada: iu.cantidad_utilizada,
        };
      });
    } else {
      const proc = procedimientos.find(
        (p) => String(p.id) === String(consulta.procedimiento_id)
      );
      if (proc && proc.insumos_necesarios) {
        if (Array.isArray(proc.insumos_necesarios)) {
          nuevosInsumos = proc.insumos_necesarios;
        } else if (typeof proc.insumos_necesarios === "string") {
          nuevosInsumos = proc.insumos_necesarios
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
            .map(
              (nombre) =>
                inventario.find((i) => i.nombre_insumo === nombre) || {
                  nombre_insumo: nombre,
                }
            );
        }
        nuevosInsumos = nuevosInsumos.map((i) => ({
          ...i,
          cantidad_utilizada: 1,
        }));
      }
    }
    // Solo actualiza si realmente cambió
    if (!insumosIguales(insumosSeleccionados, nuevosInsumos)) {
      setInsumosSeleccionados(nuevosInsumos);
      setCantidadErrores({});
    }
  }, [open, consulta?.id, procedimientos, inventario]);

  // Validación de cantidades
  const validarCantidad = (idx, cantidad) => {
    const insumo = insumosSeleccionados[idx];
    const inventarioInsumo = inventario.find((i) => i.id === insumo.id);
    if (inventarioInsumo && cantidad > inventarioInsumo.cantidad) {
      setCantidadErrores((prev) => ({ ...prev, [idx]: true }));
    } else {
      setCantidadErrores((prev) => ({ ...prev, [idx]: false }));
    }
  };
  const algunaCantidadInvalida = Object.values(cantidadErrores).some(Boolean);

  const handleEditConsultaProcedimiento = async (consulta) => {
    // Si el inventario está vacío, hacer fetch
    if (!insumos || insumos.length === 0) {
      try {
        const res = await api.get("/inventario");
        setInventarioEdicion(res.data);
      } catch {
        setInventarioEdicion([]);
      }
    } else {
      setInventarioEdicion(insumos);
    }
    setEditConsultaProcedimiento(consulta);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ver Procedimiento Realizado</DialogTitle>
      <Formik
        initialValues={{
          ...consulta,
          fecha_realizacion: consulta?.fecha_realizacion?.slice(0, 10) || "",
        }}
        enableReinitialize
        validationSchema={Yup.object().shape({
          paciente_id: Yup.string().required("Selecciona un paciente"),
          procedimiento_id: Yup.string().required(
            "Selecciona un procedimiento"
          ),
          odontologo_id: Yup.string().required("Selecciona un odontólogo"),
          notas_clinicas: Yup.string(),
          fecha_realizacion: Yup.string().required("Fecha requerida"),
        })}
        onSubmit={(values, formikHelpers) => {
          onSubmit(
            {
              ...values,
              insumos_utilizados: insumosSeleccionados.map((i) => ({
                insumo_id: i.id,
                cantidad_utilizada: i.cantidad_utilizada,
              })),
            },
            formikHelpers
          );
        }}
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
                  InputProps={{ readOnly: true }}
                  SelectProps={{ native: false, readOnly: true }}
                  fullWidth
                  disabled
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
                  InputProps={{ readOnly: true }}
                  SelectProps={{ native: false, readOnly: true }}
                  fullWidth
                  disabled
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
                  InputProps={{ readOnly: true }}
                  SelectProps={{ native: false, readOnly: true }}
                  fullWidth
                  disabled
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
                  InputProps={{ readOnly: true }}
                  fullWidth
                  multiline
                  minRows={2}
                  disabled
                />
                <TextField
                  label="Fecha de realización"
                  name="fecha_realizacion"
                  type="date"
                  value={values.fecha_realizacion}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
                {insumosSeleccionados.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Insumos utilizados:
                    </Typography>
                    <Box
                      sx={{
                        backgroundColor: "#f5f7fa",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: 1,
                        mb: 2,
                      }}
                    >
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Insumo
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Cantidad
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  fontWeight: "bold",
                                  backgroundColor: "#e3e8ee",
                                }}
                              >
                                Stock disponible
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {insumosSeleccionados.map((insumo, idx) => {
                              const inventarioInsumo = inventario.find(
                                (i) => i.id === insumo.id
                              );
                              let stockOriginal = "-";
                              if (inventarioInsumo) {
                                if (
                                  typeof inventarioInsumo.cantidad_disponible !==
                                  "undefined"
                                ) {
                                  stockOriginal = Number(
                                    inventarioInsumo.cantidad_disponible
                                  );
                                } else if (
                                  typeof inventarioInsumo.cantidad !==
                                  "undefined"
                                ) {
                                  stockOriginal = Number(
                                    inventarioInsumo.cantidad
                                  );
                                }
                              }
                              const stock =
                                stockOriginal !== "-" && !isNaN(stockOriginal)
                                  ? Math.max(stockOriginal, 0)
                                  : 0;
                              return (
                                <TableRow
                                  key={insumo.id || insumo.nombre_insumo}
                                >
                                  <TableCell align="center">
                                    {insumo.nombre_insumo}
                                  </TableCell>
                                  <TableCell align="center">
                                    <TextField
                                      disabled
                                      readOnly
                                      type="number"
                                      size="small"
                                      value={insumo.cantidad_utilizada}
                                      inputProps={{
                                        min: 1,
                                        max:
                                          stockOriginal !== "-"
                                            ? stockOriginal
                                            : undefined,
                                        style: { textAlign: "center" },
                                        step: 1,
                                      }}
                                      sx={{
                                        width: 80,
                                        backgroundColor: "#fff",
                                        borderRadius: 1,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography
                                      sx={{
                                        fontWeight:
                                          stock < 5 ? "bold" : "normal",
                                        color:
                                          stock < 5 ? "#d32f2f" : "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      {typeof stock === "number" &&
                                      !isNaN(stock)
                                        ? stock
                                        : 0}
                                      {stock < 5 && (
                                        <span
                                          style={{
                                            marginLeft: 6,
                                            fontSize: 18,
                                          }}
                                          title="Stock crítico"
                                        >
                                          ⚠️
                                        </span>
                                      )}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: "#FFF3E0",
                        color: "#E65100",
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      No es recomendable editar los Procedimientos realizados a los pacientes, ya que esto puede afectar el historial clínico. Si es necesario realizar cambios, se recomienda crear un nuevo procedimiento.
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            {/* Eliminar los botones del footer */}
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

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
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [insumos, setInsumos] = useState([]);
  const [editProcedimiento, setEditProcedimiento] = useState(null);
  const [editConsultaProcedimiento, setEditConsultaProcedimiento] =
    useState(null);
  const [inventarioEdicion, setInventarioEdicion] = useState([]);

  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const rol = usuario?.rol;

  useEffect(() => {
    Promise.all([
      api.get("/procedimientos"),
      api.get("/pacientes"),
      api.get("/usuarios"),
      api.get("/consultas-procedimientos"),
      api.get("/inventario"),
    ])
      .then(
        ([
          procedimientosRes,
          pacientesRes,
          usuariosRes,
          consultasProcedimientosRes,
          inventarioRes,
        ]) => {
          setProcedimientos(procedimientosRes.data);
          setProcedimientosList(procedimientosRes.data);
          setPacientes(pacientesRes.data);
          setOdontologos(
            usuariosRes.data.filter((u) => u.rol === "odontologo")
          );
          setConsultasProcedimientos(consultasProcedimientosRes.data);
          setInsumos(inventarioRes.data);
        }
      )
      .catch(() => {
        setProcedimientos([]);
        setProcedimientosList([]);
        setPacientes([]);
        setOdontologos([]);
        setConsultasProcedimientos([]);
        setInsumos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        insumos_necesarios: values.insumos_necesarios
          .map((i) => i.nombre_insumo)
          .join(","),
      };
      await api.post("/procedimientos", payload);
      setAlert({
        open: true,
        message: "Procedimiento de catálogo creado exitosamente",
        severity: "success",
      });
      setTimeout(() => setOpenDialog(false), 1200);
      const res = await api.get("/procedimientos");
      setProcedimientos(res.data);
      setProcedimientosList(res.data);
    } catch {
      setAlert({
        open: true,
        message: "Error al crear procedimiento de catálogo",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProcedimiento = async (values, { setSubmitting }) => {
    try {
      const payload = {
        ...values,
        insumos_necesarios: values.insumos_necesarios
          .map((i) => i.nombre_insumo)
          .join(","),
      };
      await api.put(`/procedimientos/${values.id}`, payload);
      setAlert({
        open: true,
        message: "Procedimiento editado exitosamente",
        severity: "success",
      });
      setEditProcedimiento(null);
      const res = await api.get("/procedimientos");
      setProcedimientos(res.data);
      setProcedimientosList(res.data);
    } catch {
      setAlert({
        open: true,
        message: "Error al editar procedimiento",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProcedimiento = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este procedimiento?"))
      return;
    try {
      await api.delete(`/procedimientos/${id}`);
      setAlert({
        open: true,
        message: "Procedimiento eliminado exitosamente",
        severity: "success",
      });
      const res = await api.get("/procedimientos");
      setProcedimientos(res.data);
      setProcedimientosList(res.data);
    } catch {
      setAlert({
        open: true,
        message: "Error al eliminar procedimiento",
        severity: "error",
      });
    }
  };

  const handleOpenDialogPaciente = async () => {
    const res = await api.get("/procedimientos");
    console.log(res.data);
    setProcedimientosList(res.data);
    setOpenDialogPaciente(true);
  };

  const handleCloseDialogPaciente = async () => {
    setOpenDialogPaciente(false);
    // Refresca la lista de procedimientos desde el backend al cerrar el modal
    const res = await api.get("/procedimientos");
    setProcedimientosList(res.data);
  };

  const formatFecha = (fechaIso) => {
    if (!fechaIso) return "-";
    const d = new Date(fechaIso);
    if (isNaN(d)) return fechaIso;
    return d.toLocaleDateString("es-MX");
  };

  const handleEditConsultaProcedimiento = (consulta) => {
    // Si el inventario está vacío, hacer fetch
    if (!insumos || insumos.length === 0) {
      api
        .get("/inventario")
        .then((res) => {
          setInventarioEdicion(res.data);
          setEditConsultaProcedimiento(consulta);
        })
        .catch(() => {
          setInventarioEdicion([]);
          setEditConsultaProcedimiento(consulta);
        });
    } else {
      setInventarioEdicion(insumos);
      setEditConsultaProcedimiento(consulta);
    }
  };

  const handleDeleteConsultaProcedimiento = async (id) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar este procedimiento realizado?"
      )
    )
      return;
    try {
      await api.delete(`/consultas-procedimientos/${id}`);
      setAlert({
        open: true,
        message: "Procedimiento realizado eliminado exitosamente",
        severity: "success",
      });
      const res = await api.get("/consultas-procedimientos");
      setConsultasProcedimientos(res.data);
    } catch {
      setAlert({
        open: true,
        message: "Error al eliminar procedimiento realizado",
        severity: "error",
      });
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
            {(rol === "administrador" || rol === "asistente") && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                color="primary"
                sx={{ mt: 2, mr: 2 }}
              >
                Registrar procedimiento (catálogo)
              </Button>
            )}
            {rol === "administrador" && (
              <>
                <EditarProcedimientoDialog
                  open={!!editProcedimiento}
                  onClose={() => setEditProcedimiento(null)}
                  procedimiento={editProcedimiento}
                  insumos={insumos}
                  onSubmit={handleEditProcedimiento}
                />
              </>
            )}
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
                      {rol === "administrador" && (
                        <TableCell>Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {procedimientos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.nombre}</TableCell>
                        <TableCell>{p.precio}</TableCell>
                        <TableCell>{p.descripcion}</TableCell>
                        {rol === "administrador" && (
                          <TableCell>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => setEditProcedimiento(p)}
                              startIcon={<EditIcon />}
                              sx={{ minWidth: 0, p: 1 }}
                            />
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProcedimiento(p.id)}
                              startIcon={<DeleteIcon />}
                              sx={{ minWidth: 0, p: 1 }}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {rol === "odontologo" && (
              <Box mt={2}>
                <Typography color="info.main">
                  Solo puedes visualizar el catálogo de procedimientos. Para
                  agregar o modificar, contacta a un administrador o asistente.
                </Typography>
              </Box>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <Button
              variant="outlined"
              onClick={handleOpenDialogPaciente}
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
                    {(rol === "administrador" || rol === "asistente") && (
                      <TableCell>Acciones</TableCell>
                    )}
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
                          <TableCell>
                            {formatFecha(c.fecha_realizacion)}
                          </TableCell>
                          <TableCell>{c.notas_clinicas || "-"}</TableCell>
                          <TableCell>{estatus}</TableCell>
                          {(rol === "administrador" || rol === "asistente") && (
                            <TableCell>
                              <Button
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleEditConsultaProcedimiento(c)
                                }
                                startIcon={<VisibilityIcon />}
                                sx={{ minWidth: 0, p: 1 }}
                              />
                              <Button
                                size="small"
                                color="error"
                                onClick={() =>
                                  handleDeleteConsultaProcedimiento(c.id)
                                }
                                startIcon={<DeleteIcon />}
                                sx={{ minWidth: 0, p: 1 }}
                              />
                            </TableCell>
                          )}
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
        insumos={insumos}
      />
      <EditarConsultaProcedimientoDialog
        open={!!editConsultaProcedimiento}
        onClose={() => setEditConsultaProcedimiento(null)}
        consulta={editConsultaProcedimiento}
        pacientes={pacientes}
        procedimientos={procedimientosList}
        odontologos={odontologos}
        inventario={inventarioEdicion}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await api.put(`/consultas-procedimientos/${values.id}`, {
              ...values,
              paciente_id: Number(values.paciente_id),
              procedimiento_id: Number(values.procedimiento_id),
              odontologo_id: Number(values.odontologo_id),
            });
            setAlert({
              open: true,
              message: "Procedimiento realizado editado exitosamente",
              severity: "success",
            });
            setEditConsultaProcedimiento(null);
            const res = await api.get("/consultas-procedimientos");
            setConsultasProcedimientos(res.data);
          } catch {
            setAlert({
              open: true,
              message: "Error al editar procedimiento realizado",
              severity: "error",
            });
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <RegistroProcedimientoPacienteDialog
        open={openDialogPaciente}
        onClose={handleCloseDialogPaciente}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await api.post("/consultas-procedimientos", {
              ...values,
              paciente_id: Number(values.paciente_id),
              procedimiento_id: Number(values.procedimiento_id),
              odontologo_id: Number(values.odontologo_id),
              fecha_realizacion: values.fecha_realizacion,
              insumos_utilizados: values.insumos_utilizados, // Asegura que se envía el array
            });
            setAlert({
              open: true,
              message: "Procedimiento realizado registrado",
              severity: "success",
            });
            // Refrescar la lista de procedimientos realizados desde el backend
            const res = await api.get("/consultas-procedimientos");
            setConsultasProcedimientos(res.data);
            setTimeout(() => handleCloseDialogPaciente(), 1200);
          } catch {
            setAlert({
              open: true,
              message: "Error al registrar procedimiento realizado",
              severity: "error",
            });
          } finally {
            setSubmitting(false);
          }
        }}
        pacientes={pacientes}
        procedimientos={procedimientosList}
        odontologos={odontologos}
        inventario={insumos} // <-- PASA EL INVENTARIO GLOBAL
      />
      {!(rol === "administrador" || rol === "asistente") && (
        <RegistroProcedimientoDialog
          open={false}
          onClose={handleCloseDialog}
          onSubmit={handleSubmit}
        />
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

export default Procedimientos;

// Nota: Si los registros de consultas-procedimientos se eliminan de la base de datos,
// no es posible recuperar la cantidad utilizada de insumos para esos procedimientos.
// Para mantener el historial, considera no eliminar físicamente los registros o usar un borrado lógico.
