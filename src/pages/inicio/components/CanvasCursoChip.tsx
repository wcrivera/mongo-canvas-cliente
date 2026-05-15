import {
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
// import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useAppDispatch } from "../../../store/hooks";
import {
  eliminarCanvasCurso,
} from "../../../store/slices/mongoCurso";
import type { ICanvasCursoAsociado } from "../../../store/slices/mongoCurso";
import { DeleteOutlineOutlined } from "@mui/icons-material";

interface Props {
  curso_id: string;
  canvasCurso: ICanvasCursoAsociado;
}

const formatearAnio = (start_at: string | null): string => {
  if (!start_at) return "Sin fecha";
  try {
    return new Date(start_at).getFullYear().toString();
  } catch {
    return "Sin fecha";
  }
};

const CanvasCursoChip = ({ curso_id, canvasCurso }: Props) => {
  const dispatch = useAppDispatch();

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar ${canvasCurso.nombre}?`)) return;
    await dispatch(
      eliminarCanvasCurso({ curso_id, canvas_id: canvasCurso.canvas_id })
    );
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2 animate-fadeIn-fast transition-all ${
        canvasCurso.activo
          ? "bg-[#f0f4f8] border border-[#b3c9dd]"
          : "bg-gray-50 border border-gray-200 opacity-60"
      }`}
    >
      {/* Info */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <Typography
          variant="body2"
          sx={{ color: "#2e4154", fontWeight: 500 }}
          noWrap
        >
          {canvasCurso.nombre}
        </Typography>
        <Typography variant="caption" sx={{ color: "#6793ba" }}>
          ID {canvasCurso.canvas_id} · {formatearAnio(canvasCurso.agregado_at)}
        </Typography>
      </div>

      {/* Badge estado + acciones */}
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <Tooltip title="Eliminar asociación">
          <IconButton
            size="small"
            onClick={handleEliminar}
            sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteOutlineOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default CanvasCursoChip;