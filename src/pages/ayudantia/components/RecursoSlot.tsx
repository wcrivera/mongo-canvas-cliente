import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface RecursoSlotProps {
  exists: boolean;
  label: string;
  icon: React.ReactNode;
  iconColor: string;
  onVer?: () => void;
  onEditar?: () => void;
  onEliminar?: () => void;
  onCrear?: () => void;
}

const RecursoSlot = ({
  exists,
  label,
  icon,
  iconColor,
  onVer,
  onEditar,
  onEliminar,
  onCrear,
}: RecursoSlotProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  if (!exists) {
    return (
      <button
        onClick={onCrear}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 10px",
          height: 26,
          borderRadius: 20,
          border: "0.5px dashed #CBD5E1",
          background: "transparent",
          fontSize: 11,
          color: "#94A3B8",
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#2563EB";
          (e.currentTarget as HTMLButtonElement).style.color = "#2563EB";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#CBD5E1";
          (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
        }}
      >
        <AddIcon sx={{ fontSize: 12 }} /> {label}
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginRight: 20,
        }}
      >
        <IconButton
          aria-label={`menu-${label}`}
          // sx={iconBtnSmSx}
          sx={{ color: iconColor }}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
        >
          {icon}
        </IconButton>
        <span style={{ fontSize: 14, color: "gray", fontWeight: 400 }}>
          {label}
        </span>
      </div>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 140,
              borderRadius: "8px",
              border: "0.5px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onVer?.();
          }}
          sx={{
            gap: 1.5,
            py: 1,
            fontSize: 13,
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <ListItemIcon>
            <VisibilityIcon sx={{ fontSize: 14, color: "#1a8d18" }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "#334155" }}>
            Ver
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onEditar?.();
          }}
          sx={{
            gap: 1.5,
            py: 1,
            fontSize: 13,
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          <ListItemIcon>
            <EditIcon sx={{ fontSize: 14, color: "#2563EB" }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "#334155" }}>
            Editar
          </Typography>
        </MenuItem>
        <Divider sx={{ borderColor: "#F1F5F9", my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onEliminar?.();
          }}
          sx={{
            gap: 1.5,
            py: 1,
            fontSize: 13,
            "&:hover": { bgcolor: "#FFF5F5" },
          }}
        >
          <ListItemIcon>
            <DeleteIcon sx={{ fontSize: 14, color: "#EF4444" }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: "#EF4444" }}>
            Eliminar
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default RecursoSlot;
