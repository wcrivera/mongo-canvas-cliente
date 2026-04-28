import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  obtenerCanvasCursosDisponibles,
  limpiarDisponibles,
} from "../../../store/slices/canvasCurso";
import { asociarCanvasCurso } from "../../../store/slices/mongoCurso";

interface Props {
  curso_id: string;
  onClose: () => void;
}

const ModalAsociarCanvas = ({ curso_id, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { disponibles, isLoading } = useAppSelector((s) => s.canvasCurso);
  const [seleccionado, setSeleccionado] = useState<string>("");

  useEffect(() => {
    dispatch(obtenerCanvasCursosDisponibles({ curso_mongo_id: curso_id }));
    return () => {
      dispatch(limpiarDisponibles());
    };
  }, [curso_id, dispatch]);

  const handleAsociar = async () => {
    if (!seleccionado) return;
    const curso = disponibles.find((c) => c.id === Number(seleccionado));
    if (!curso) return;
    await dispatch(
      asociarCanvasCurso({ curso_id, canvas_id: curso.id, nombre: curso.name }),
    );
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#4A6D8C",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <SchoolIcon />
        <span>Asociar curso Canvas</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress size={32} sx={{ color: "#4A6D8C" }} />
          </div>
        ) : disponibles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <SchoolIcon sx={{ fontSize: 40, color: "#b3c9dd" }} />
            <Typography variant="body2" color="text.secondary">
              No hay cursos Canvas disponibles para asociar.
            </Typography>
          </div>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              Selecciona el curso Canvas que deseas asociar:
            </Typography>
            <RadioGroup
              value={seleccionado}
              onChange={(e) => setSeleccionado(e.target.value)}
              className="flex flex-col gap-2"
            >
              {disponibles.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSeleccionado(String(c.id))}
                  className={`flex items-center rounded-xl border px-4 py-3 cursor-pointer transition-all animate-fadeIn ${
                    seleccionado === String(c.id)
                      ? "border-[#4A6D8C] bg-[#f0f4f8]"
                      : "border-gray-200 hover:border-[#8daecb] hover:bg-[#f0f4f8]/50"
                  }`}
                >
                  <FormControlLabel
                    value={String(c.id)}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "#8daecb",
                          "&.Mui-checked": { color: "#4A6D8C" },
                        }}
                      />
                    }
                    label={
                      <div className="flex flex-col">
                        <Typography
                          variant="body2"
                          sx={{ color: "#2e4154", fontWeight: 500 }}
                        >
                          {c.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6793ba" }}>
                          {c.course_code} · ID: {c.id} {c.created_at && `· Creado ${new Date(c.created_at).toLocaleDateString()}`}
                        </Typography>
                      </div>
                    }
                    sx={{ margin: 0, width: "100%" }}
                  />
                </div>
              ))}
            </RadioGroup>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{ color: "#6793ba", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAsociar}
          variant="contained"
          disabled={!seleccionado || isLoading}
          sx={{
            bgcolor: "#4A6D8C",
            borderRadius: 2,
            px: 3,
            "&:hover": { bgcolor: "#3c5770" },
            "&:disabled": { bgcolor: "#b3c9dd" },
          }}
        >
          Asociar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAsociarCanvas;
