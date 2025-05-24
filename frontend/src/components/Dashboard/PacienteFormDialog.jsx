import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

const PacienteSchema = Yup.object().shape({
  nombre: Yup.string().required("Requerido"),
  documento_identidad: Yup.string().required("Requerido"),
  telefono: Yup.string().required("Requerido"),
  email: Yup.string().email("Email inválido").required("Requerido"),
  direccion: Yup.string().required("Requerido"),
  historial: Yup.string(),
  odontologo_id: Yup.string().required("Selecciona un odontólogo"),
});

const PacienteFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  odontologos = [],
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialValues?.id ? "Editar Paciente" : "Nuevo Paciente"}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={PacienteSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, handleChange, touched, errors }) => (
          <Form>
            <DialogContent>
              <Box mb={2}>
                <span style={{ color: "red", fontWeight: 500 }}>*</span> Campos
                obligatorios
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Nombre completo
                    </>
                  }
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  fullWidth
                />
                <TextField
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Cédula / DNI
                    </>
                  }
                  name="documento_identidad"
                  value={values.documento_identidad}
                  onChange={handleChange}
                  error={
                    touched.documento_identidad &&
                    Boolean(errors.documento_identidad)
                  }
                  helperText={
                    touched.documento_identidad && errors.documento_identidad
                  }
                  fullWidth
                />
                <TextField
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Teléfono
                    </>
                  }
                  name="telefono"
                  value={values.telefono}
                  onChange={handleChange}
                  error={touched.telefono && Boolean(errors.telefono)}
                  helperText={touched.telefono && errors.telefono}
                  fullWidth
                />
                <TextField
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Email
                    </>
                  }
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  fullWidth
                />
                <TextField
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Dirección
                    </>
                  }
                  name="direccion"
                  value={values.direccion}
                  onChange={handleChange}
                  error={touched.direccion && Boolean(errors.direccion)}
                  helperText={touched.direccion && errors.direccion}
                  fullWidth
                />
                <TextField
                  label="Historial odontológico previo"
                  name="historial"
                  value={values.historial}
                  onChange={handleChange}
                  error={touched.historial && Boolean(errors.historial)}
                  helperText={touched.historial && errors.historial}
                  fullWidth
                  multiline
                  minRows={3}
                />
                <TextField
                  select
                  label={
                    <>
                      <span style={{ color: "red" }}>*</span> Odontólogo
                      asignado
                    </>
                  }
                  name="odontologo_id"
                  value={values.odontologo_id || ""}
                  onChange={handleChange}
                  error={touched.odontologo_id && Boolean(errors.odontologo_id)}
                  helperText={touched.odontologo_id && errors.odontologo_id}
                  fullWidth
                >
                  {odontologos.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </TextField>
              </Box>
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
};

export default PacienteFormDialog;
