import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import DashboardLayout from "./DashboardLayout";
import Pacientes from "./Pacientes";
import Procedimientos from "./Procedimientos";
import Facturacion from "./Facturacion";
import Inventario from "./Inventario";
import AuthGuard from "../Auth/AuthGuard";
import Usuarios from "./Usuarios";

const Dashboard = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route
          path="/"
          element={
            <AuthGuard>
              <Box p={4}>
                <Paper elevation={1} sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h4">
                    {usuario
                      ? `Bienvenido/a, ${usuario.nombre}`
                      : "Bienvenido/a"}
                  </Typography>
                  <Typography variant="subtitle1">
                    Selecciona una sección del menú para comenzar.
                  </Typography>
                </Paper>
              </Box>
            </AuthGuard>
          }
        />
        <Route
          path="pacientes"
          element={
            <AuthGuard>
              <Pacientes />
            </AuthGuard>
          }
        />
        <Route
          path="procedimientos"
          element={
            <AuthGuard>
              <Procedimientos />
            </AuthGuard>
          }
        />
        <Route
          path="facturacion"
          element={
            <AuthGuard>
              <Facturacion />
            </AuthGuard>
          }
        />
        <Route
          path="inventario"
          element={
            <AuthGuard>
              <Inventario />
            </AuthGuard>
          }
        />
        <Route
          path="usuarios"
          element={
            <AuthGuard>
              {usuario?.rol === "administrador" ? (
                <Usuarios />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </AuthGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
