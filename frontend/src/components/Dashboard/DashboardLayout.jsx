import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Box,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ReceiptIcon from "@mui/icons-material/Receipt";
import InventoryIcon from "@mui/icons-material/Inventory";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate } from "react-router-dom";

const menuItems = [
  { text: "Pacientes", icon: <PeopleIcon />, path: "/dashboard/pacientes" },
  {
    text: "Procedimientos",
    icon: <MedicalServicesIcon />,
    path: "/dashboard/procedimientos",
  },
  {
    text: "Facturación",
    icon: <ReceiptIcon />,
    path: "/dashboard/facturacion",
  },
  {
    text: "Inventario",
    icon: <InventoryIcon />,
    path: "/dashboard/inventario",
  },
];

const drawerWidth = 220;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ cursor: "pointer", flexGrow: 1 }}
            onClick={() => navigate("/dashboard")}
          >
            Módulo Odontología
          </Typography>
          {usuario && (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {usuario.nombre} ({usuario.rol})
              </Typography>
              <LogoutIcon
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("usuario");
                  window.location.href = "/login";
                }}
              />
            </>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: "100vh" }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
