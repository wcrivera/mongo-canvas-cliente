import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/auth/authSlice";
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyIcon from "@mui/icons-material/Key";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { email, nombre, role } = useAppSelector((s) => s.auth);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // Iniciales para el avatar
  const iniciales = nombre
    ? nombre
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (email?.[0]?.toUpperCase() ?? "U");

  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{ backgroundColor: "#1f2c38", borderBottom: "1px solid #2d3f50" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#4A6D8C" }}
        >
          <span className="text-white text-sm font-bold">M</span>
        </div>
        <Typography variant="body1" sx={{ color: "white", fontWeight: 600 }}>
          Canvas Matemáticas
        </Typography>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <Typography variant="body2" sx={{ color: "white", lineHeight: 1.2 }}>
            {nombre ?? email}
          </Typography>
          <Typography variant="caption" sx={{ color: "#6793ba" }}>
            {role === "admin"
              ? "Administrador"
              : role === "profesor"
                ? "Profesor"
                : "Estudiante"}
          </Typography>
        </div>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#4A6D8C",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {iniciales}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: { mt: 1, minWidth: 200, borderRadius: 2 },
            },
          }}
        >
          <div className="px-4 py-2">
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#1f2c38" }}
            >
              {nombre ?? "Usuario"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6793ba" }}>
              {email}
            </Typography>
          </div>

          <Divider />

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/token-canvas");
            }}
            sx={{ gap: 1.5, py: 1.5 }}
          >
            <ListItemIcon>
              <KeyIcon fontSize="small" sx={{ color: "#4A6D8C" }} />
            </ListItemIcon>
            <Typography variant="body2">Token Canvas</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate("/perfil");
            }}
            sx={{ gap: 1.5, py: 1.5 }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: "#4A6D8C" }} />
            </ListItemIcon>
            <Typography variant="body2">Mi perfil</Typography>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.5, color: "#ef4444" }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#ef4444" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#ef4444" }}>
              Cerrar sesión
            </Typography>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Navbar;
