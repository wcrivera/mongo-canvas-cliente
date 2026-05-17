// src/pages/ejercicios/components/ModalCrearEjercicio.tsx
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress, RadioGroup,
  FormControlLabel, Radio,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";

import { useAppDispatch }  from "../../../store/hooks";
import {
  crearEjercicio,
  type TipoPreguntaEjercicio,
} from "../../../store/slices/ejercicio";

interface Props {
  capitulo_id: string;
  onClose:     () => void;
  onCreado:    () => void;
}

// Solo tipos que el frontend puede manejar correctamente
const TIPOS: { key: TipoPreguntaEjercicio; label: string; desc: string }[] = [
  { key: "multiple_choice",         label: "Alternativas",   desc: "Una respuesta correcta entre opciones" },
  { key: "multiple_answers",        label: "Múltiple",       desc: "Varias respuestas correctas posibles" },
  { key: "true_false",              label: "Verdadero / Falso", desc: "El estudiante elige V o F" },
  { key: "matching",                label: "Pareo",           desc: "Relaciona columna izquierda con derecha" },
  { key: "numerical",               label: "Numérico",        desc: "Respuesta numérica con margen de error" },
  { key: "fill_in_multiple_blanks", label: "Completar",       desc: "Completa el espacio en blanco" },
];

const ModalCrearEjercicio = ({ capitulo_id, onClose, onCreado }: Props) => {
  const dispatch = useAppDispatch();
  const [tipo,    setTipo]    = useState<TipoPreguntaEjercicio>("multiple_choice");
  const [creando, setCreando] = useState(false);

  const handleCrear = async () => {
    setCreando(true);
    const resultado = await dispatch(
      crearEjercicio({
        capitulo_id,
        nombre:        "Ejercicio",
        enunciado:     "",
        tipo_pregunta: tipo,
        opciones:
          tipo === "multiple_choice" || tipo === "multiple_answers"
            ? [{ texto: "", es_correcta: false }, { texto: "", es_correcta: false }]
            : tipo === "true_false"
            ? [{ texto: "Verdadero", es_correcta: false }, { texto: "Falso", es_correcta: false }]
            : [],
        pares:    tipo === "matching" ? [{ izquierda: "", derecha: "" }] : [],
        puntos:   1,
        published: false,
      })
    ) as unknown as { ok: boolean };
    setCreando(false);
    if (resultado.ok) onCreado();
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px" } } }}>

      <DialogTitle sx={{ bgcolor: "#1E293B", color: "white", display: "flex", alignItems: "center", gap: 1.5, py: 2, px: 3, fontFamily: "Georgia, serif", fontSize: "17px", fontWeight: "normal" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "#2563EB", border: "1px solid #3B82F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <EditNoteIcon sx={{ fontSize: 16, color: "white" }} />
        </div>
        Nuevo ejercicio
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
          Selecciona el tipo de pregunta:
        </Typography>

        <RadioGroup value={tipo} onChange={(e) => setTipo(e.target.value as TipoPreguntaEjercicio)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TIPOS.map((t) => (
              <div
                key={t.key}
                onClick={() => setTipo(t.key)}
                style={{
                  border:       tipo === t.key ? "1.5px solid #BFDBFE" : "0.5px solid #E2E8F0",
                  background:   tipo === t.key ? "#EFF6FF" : "#F8FAFC",
                  borderRadius: 10, padding: "8px 12px 8px 6px",
                  cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                  display: "flex", alignItems: "center",
                }}
              >
                <FormControlLabel
                  value={t.key}
                  control={<Radio size="small" sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#2563EB" } }} />}
                  label={
                    <div>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: tipo === t.key ? "#1E3A8A" : "#334155", lineHeight: 1.2 }}>
                        {t.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        {t.desc}
                      </Typography>
                    </div>
                  }
                  sx={{ margin: 0, width: "100%" }}
                />
              </div>
            ))}
          </div>
        </RadioGroup>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "#94A3B8", textTransform: "none", borderRadius: "8px", "&:hover": { bgcolor: "#F8FAFC" } }}>
          Cancelar
        </Button>
        <Button
          onClick={handleCrear} variant="contained" disabled={creando}
          startIcon={creando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ bgcolor: "#2563EB", borderRadius: "8px", px: 2.5, fontWeight: 500, fontSize: "13px", textTransform: "none", boxShadow: "none", "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" } }}
        >
          {creando ? "Creando..." : "Crear ejercicio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalCrearEjercicio;