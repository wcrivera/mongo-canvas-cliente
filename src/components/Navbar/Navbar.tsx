// src/components/Navbar/Navbar.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/auth/authSlice";
import {
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from "@mui/material";
import LogoutIcon        from "@mui/icons-material/Logout";
import KeyIcon           from "@mui/icons-material/Key";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const ROLE_LABEL: Record<string, string> = {
  admin:      "Administrador",
  profesor:   "Profesor",
  estudiante: "Estudiante",
};

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

  const iniciales = nombre
    ? nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : (email?.[0]?.toUpperCase() ?? "U");

  const roleLabel = ROLE_LABEL[role ?? ""] ?? "Usuario";

  return (
    <nav
      className="flex items-center justify-between px-6 sticky top-0 z-10"
      style={{ height: 52, background: "#1E293B" }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width:        30,
            height:       30,
            borderRadius: 8,
            background:   "#2563EB",
            border:       "1px solid #3B82F6",
            fontSize:     15,
            fontFamily:   "Georgia, serif",
            fontWeight:   "bold",
            color:        "white",
          }}
        >
          M
        </div>
        <div>
          <p
            style={{
              fontFamily:  "Georgia, serif",
              fontSize:    14,
              color:       "white",
              lineHeight:  1,
              letterSpacing: "0.01em",
            }}
          >
            Manthano
          </p>
          <p
            style={{
              fontSize:    9.5,
              color:       "rgba(255, 255, 255, 0.6)",
              letterSpacing: "0.04em",
              marginTop:   2,
              lineHeight:  1,
            }}
          >
            Canvas Matemáticas UC
          </p>
        </div>
      </div>

      {/* ── Usuario ── */}
      <div className="flex items-center gap-2.5">

        {/* Nombre + rol */}
        <div className="text-right hidden sm:block">
          <p
            style={{
              fontSize:   12,
              fontWeight: 500,
              color:      "rgba(255,255,255,0.88)",
              lineHeight: 1,
              marginBottom: 3,
            }}
          >
            {nombre ?? email}
          </p>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>
            {roleLabel}
          </p>
        </div>

        {/* Avatar */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{ p: 0 }}
        >
          <Avatar
            sx={{
              width:      30,
              height:     30,
              bgcolor:    "#2563EB",
              fontSize:   11,
              fontWeight: 600,
              border:     "1.5px solid #3B82F6",
            }}
          >
            {iniciales}
          </Avatar>
        </IconButton>

        {/* ── Menú desplegable ── */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt:          1,
                minWidth:    220,
                borderRadius: "10px",
                border:      "0.5px solid #E2E8F0",
                boxShadow:   "0 4px 20px rgba(0,0,0,0.08)",
              },
            },
          }}
        >
          {/* Perfil */}
          <div style={{ padding: "14px 16px", borderBottom: "0.5px solid #F1F5F9" }}>
            <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
              <Avatar
                sx={{
                  width:      34,
                  height:     34,
                  bgcolor:    "#2563EB",
                  fontSize:   12,
                  fontWeight: 600,
                  border:     "1.5px solid #3B82F6",
                  flexShrink: 0,
                }}
              >
                {iniciales}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight:   500,
                    color:        "#1E293B",
                    lineHeight:   1.3,
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {nombre ?? "Usuario"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:        "#94A3B8",
                    display:      "block",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace:   "nowrap",
                  }}
                >
                  {email}
                </Typography>
              </div>
            </div>

            {/* Pill de rol */}
            <span
              style={{
                display:       "inline-block",
                fontSize:      10,
                fontWeight:    500,
                padding:       "2px 10px",
                borderRadius:  20,
                background:    "#EFF6FF",
                color:         "#1E3A8A",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {roleLabel}
            </span>
          </div>

          {/* Items */}
          <MenuItem
            onClick={() => { setAnchorEl(null); navigate("/token-canvas"); }}
            sx={{ gap: 1.5, py: 1.25, "&:hover": { bgcolor: "#F8FAFC" } }}
          >
            <ListItemIcon>
              <KeyIcon fontSize="small" sx={{ color: "#2563EB" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#334155" }}>
              Token Canvas
            </Typography>
          </MenuItem>

          <MenuItem
            onClick={() => { setAnchorEl(null); navigate("/perfil"); }}
            sx={{ gap: 1.5, py: 1.25, "&:hover": { bgcolor: "#F8FAFC" } }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: "#2563EB" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#334155" }}>
              Mi perfil
            </Typography>
          </MenuItem>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.25, "&:hover": { bgcolor: "#FFF5F5" } }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#EF4444" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#EF4444" }}>
              Cerrar sesión
            </Typography>
          </MenuItem>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;