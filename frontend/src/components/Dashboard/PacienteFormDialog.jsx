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
});

const PacienteFormDialog = ({ open, onClose, onSubmit, initialValues }) => {
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
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Nombre completo"
                  name="nombre"
                  value={values.nombre}
                  onChange={handleChange}
                  error={touched.nombre && Boolean(errors.nombre)}
                  helperText={touched.nombre && errors.nombre}
                  fullWidth
                />
                <TextField
                  label="Cédula / DNI"
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
                  label="Teléfono"
                  name="telefono"
                  value={values.telefono}
                  onChange={handleChange}
                  error={touched.telefono && Boolean(errors.telefono)}
                  helperText={touched.telefono && errors.telefono}
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  fullWidth
                />
                <TextField
                  label="Dirección"
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
