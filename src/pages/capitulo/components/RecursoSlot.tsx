import { useState } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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
        <AddIcon sx={{ fontSize: 12 }} />
        {label}
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderRadius: 20,
          border: "0.5px solid #E2E8F0",
          overflow: "hidden",
          height: 26,
        }}
      >
        <button
          onClick={onVer}
          style={{
            background: "transparent",
            border: "none",
            borderRight: "0.5px solid #E2E8F0",
            padding: "0 10px",
            height: "100%",
            fontSize: 11,
            color: "#334155",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <span
            style={{
              color: iconColor,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
          {label}
        </button>
        <button
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          style={{
            background: "transparent",
            border: "none",
            padding: "0 7px",
            height: "100%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#94A3B8",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#F8FAFC";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <ExpandMoreIcon sx={{ fontSize: 14 }} />
        </button>
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
            <VisibilityIcon sx={{ fontSize: 14, color: "#2563EB" }} />
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
