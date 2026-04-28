// src/pages/capitulos/DeploymentBadge.tsx
import { Chip, Tooltip, IconButton, CircularProgress } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import type { ICanvasDeployment } from "../../../store/slices/capitulo";
import { useAppDispatch } from "../../../store/hooks";
import { reintentarCapitulo } from "../../../store/slices/capitulo";
import { useState } from "react";

interface Props {
  deployment: ICanvasDeployment;
  capitulo_id: string;
}

const CONFIG = {
  synced:  { label: "Sincronizado", color: "#d1fae5", text: "#065f46" },
  pending: { label: "Pendiente",    color: "#fef9c3", text: "#854d0e" },
  dirty:   { label: "Desactualizado", color: "#ffedd5", text: "#9a3412" },
  missing: { label: "No encontrado",  color: "#fee2e2", text: "#991b1b" },
  error:   { label: "Error",          color: "#fee2e2", text: "#991b1b" },
};

const DeploymentBadge = ({ deployment, capitulo_id }: Props) => {
  const dispatch = useAppDispatch();
  const [reintentando, setReintentando] = useState(false);
  const cfg = CONFIG[deployment.status];

  const handleReintentar = async () => {
    setReintentando(true);
    await dispatch(reintentarCapitulo({
      capitulo_id,
      canvas_curso_id: deployment.canvas_curso_id,
    }));
    setReintentando(false);
  };

  const puedeReintentar = deployment.status === 'error' || deployment.status === 'missing';

  return (
    <Tooltip
      title={
        deployment.error_msg
          ? `Error: ${deployment.error_msg}`
          : `Canvas ID: ${deployment.canvas_id ?? "Sin asignar"}`
      }
      arrow
    >
      <div className="flex items-center gap-1">
        <Chip
          label={`${deployment.canvas_curso_id} · ${cfg.label}`}
          size="small"
          sx={{
            fontSize: "0.65rem",
            height: 22,
            bgcolor: cfg.color,
            color: cfg.text,
            fontWeight: 600,
            borderRadius: 1.5,
          }}
        />
        {puedeReintentar && (
          reintentando ? (
            <CircularProgress size={12} sx={{ color: "#4A6D8C" }} />
          ) : (
            <IconButton
              size="small"
              onClick={handleReintentar}
              sx={{ p: 0.3, color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}
            >
              <RefreshIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )
        )}
      </div>
    </Tooltip>
  );
};

export default DeploymentBadge;