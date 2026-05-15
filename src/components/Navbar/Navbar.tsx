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
import LogoutIcon        from "@mui/icons-material/Logout";
import KeyIcon           from "@mui/icons-material/Key";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const ROLE_LABEL: Record<string, string> = {
  admin:     "Administrador",
  profesor:  "Profesor",
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
    <nav className="flex items-center justify-between px-6 h-[52px] bg-[#1E293B] sticky top-0 z-10">

      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] bg-[#2563EB] rounded-[7px] flex items-center justify-center shrink-0">
          <span
            className="text-white text-[15px] font-bold leading-none"
            style={{ fontFamily: "Georgia, serif" }}
          >
            M
          </span>
        </div>
        <span className="text-white text-sm font-medium">Canvas Matemáticas</span>
      </div>

      {/* ── Usuario ── */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <p className="text-white/90 text-xs font-medium leading-none mb-0.5">
            {nombre ?? email}
          </p>
          <p className="text-white/40 text-[11px] leading-none">{roleLabel}</p>
        </div>

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0 }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: "#2563EB",
              fontSize: 11,
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
              sx: {
                mt: 1,
                minWidth: 210,
                borderRadius: "10px",
                border: "0.5px solid #E2E8F0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              },
            },
          }}
        >
          {/* Perfil en el menú */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2.5 mb-1">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#2563EB", fontSize: 12, fontWeight: 600 }}>
                {iniciales}
              </Avatar>
              <div className="min-w-0">
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#1E293B", lineHeight: 1.3 }}>
                  {nombre ?? "Usuario"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#94A3B8", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {email}
                </Typography>
              </div>
            </div>
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1"
              style={{ background: "#EFF6FF", color: "#2563EB" }}
            >
              {roleLabel}
            </span>
          </div>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          <MenuItem
            onClick={() => { setAnchorEl(null); navigate("/token-canvas"); }}
            sx={{ gap: 1.5, py: 1.5, "&:hover": { bgcolor: "#F8FAFC" } }}
          >
            <ListItemIcon>
              <KeyIcon fontSize="small" sx={{ color: "#2563EB" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#334155" }}>Token Canvas</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => { setAnchorEl(null); navigate("/perfil"); }}
            sx={{ gap: 1.5, py: 1.5, "&:hover": { bgcolor: "#F8FAFC" } }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" sx={{ color: "#2563EB" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#334155" }}>Mi perfil</Typography>
          </MenuItem>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          <MenuItem
            onClick={handleLogout}
            sx={{ gap: 1.5, py: 1.5, "&:hover": { bgcolor: "#FFF5F5" } }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: "#EF4444" }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ color: "#EF4444" }}>Cerrar sesión</Typography>
          </MenuItem>
        </Menu>
      </div>
    </nav>
  );
};

export default Navbar;