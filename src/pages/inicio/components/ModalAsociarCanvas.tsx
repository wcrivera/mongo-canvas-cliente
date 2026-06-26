// src/pages/inicio/components/ModalAsociarCanvas.tsx
import { useEffect, useState }    from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Typography,
  Radio, RadioGroup, FormControlLabel,
} from "@mui/material";
import SchoolIcon             from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  obtenerCanvasCursosDisponibles,
  limpiarDisponibles,
} from "@/store/slices/canvasCurso";
import { asociarCanvasCurso } from "@/store/slices/mongoCurso";

interface Props {
  curso_id: string;
  onClose:  () => void;
}

const ModalAsociarCanvas = ({ curso_id, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { disponibles, isLoading } = useAppSelector((s) => s.canvasCurso);
  const [seleccionado, setSeleccionado] = useState<string>("");

  useEffect(() => {
    dispatch(obtenerCanvasCursosDisponibles({ curso_mongo_id: curso_id }));
    return () => { dispatch(limpiarDisponibles()); };
  }, [curso_id, dispatch]);

  const handleAsociar = async () => {
    if (!seleccionado) return;
    const curso = disponibles.find((c) => c.id === Number(seleccionado));
    if (!curso) return;
    await dispatch(asociarCanvasCurso({ curso_id, canvas_id: curso.id, nombre: curso.name }));
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px", overflow: "hidden" } } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor:    "#1E293B",
          color:      "white",
          display:    "flex",
          alignItems: "center",
          gap:        1.5,
          py:         2,
          px:         3,
          fontFamily: "Georgia, serif",
          fontSize:   "17px",
          fontWeight: "normal",
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "#2563EB", border: "1px solid #3B82F6",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <SchoolIcon sx={{ fontSize: 16, color: "white" }} />
        </div>
        Asociar curso Canvas
      </DialogTitle>

      {/* Contenido */}
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={28} sx={{ color: "#2563EB" }} />
          </div>
        ) : disponibles.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <SchoolIcon sx={{ fontSize: 36, color: "#E2E8F0" }} />
            <Typography variant="body2" sx={{ color: "#94A3B8" }}>
              No hay cursos Canvas disponibles para asociar.
            </Typography>
            <Typography variant="caption" sx={{ color: "#CBD5E1" }}>
              Verifica que tu token Canvas esté configurado correctamente.
            </Typography>
          </div>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2, mt: 2 }}>
              Selecciona el curso Canvas que deseas asociar:
            </Typography>
            <RadioGroup
              value={seleccionado}
              onChange={(e) => setSeleccionado(e.target.value)}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {disponibles.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSeleccionado(String(c.id))}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    borderRadius: 10,
                    border:       seleccionado === String(c.id)
                      ? "1.5px solid #BFDBFE"
                      : "0.5px solid #E2E8F0",
                    background:   seleccionado === String(c.id) ? "#EFF6FF" : "#F8FAFC",
                    cursor:       "pointer",
                    transition:   "border-color 0.15s, background 0.15s",
                    padding:      "2px 12px 2px 4px",
                  }}
                >
                  <FormControlLabel
                    value={String(c.id)}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color:            "#CBD5E1",
                          "&.Mui-checked":  { color: "#2563EB" },
                        }}
                      />
                    }
                    label={
                      <div>
                        <Typography
                          variant="body2"
                          sx={{
                            color:      seleccionado === String(c.id) ? "#1E3A8A" : "#334155",
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {c.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                          {c.course_code} · ID {c.id}
                          {c.created_at && ` · ${new Date(c.created_at).toLocaleDateString()}`}
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

      {/* Acciones */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#94A3B8", textTransform: "none", borderRadius: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAsociar}
          variant="contained"
          disabled={!seleccionado || isLoading}
          sx={{
            bgcolor:       "#2563EB",
            borderRadius:  "8px",
            px:            2.5,
            fontWeight:    500,
            fontSize:      "13px",
            textTransform: "none",
            boxShadow:     "none",
            "&:hover":     { bgcolor: "#1D4ED8", boxShadow: "none" },
            "&:disabled":  { bgcolor: "#BFDBFE", color: "white" },
          }}
        >
          Asociar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAsociarCanvas;