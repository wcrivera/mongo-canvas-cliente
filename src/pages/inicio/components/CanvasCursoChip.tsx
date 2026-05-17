// src/pages/inicio/components/CanvasCursoChip.tsx
import { IconButton, Tooltip }       from "@mui/material";
import DeleteOutlineOutlinedIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import { useAppDispatch }            from "../../../store/hooks";
import { eliminarCanvasCurso }       from "../../../store/slices/mongoCurso";
import type { ICanvasCursoAsociado } from "../../../store/slices/mongoCurso";

interface Props {
  curso_id:    string;
  canvasCurso: ICanvasCursoAsociado;
}

const CanvasCursoChip = ({ curso_id, canvasCurso }: Props) => {
  const dispatch = useAppDispatch();

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar la asociación con "${canvasCurso.nombre}"?`)) return;
    await dispatch(eliminarCanvasCurso({ curso_id, canvas_id: canvasCurso.canvas_id }));
  };

  return (
    <div
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            8,
        background:     "white",
        border:         "0.5px solid #E2E8F0",
        borderRadius:   8,
        padding:        "7px 10px",
        opacity:        canvasCurso.activo ? 1 : 0.5,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontSize: 11.5, fontWeight: 500, color: "#334155",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}>
          {canvasCurso.nombre}
        </p>
        <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
          ID {canvasCurso.canvas_id}
        </p>
      </div>

      <Tooltip title="Eliminar asociación">
        <IconButton
          size="small"
          onClick={handleEliminar}
          sx={{
            width: 22, height: 22, color: "#CBD5E1", flexShrink: 0,
            "&:hover": { color: "#EF4444", bgcolor: "#FFF5F5" },
          }}
        >
          <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default CanvasCursoChip;