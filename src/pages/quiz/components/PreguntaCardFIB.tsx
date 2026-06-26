// src/pages/quiz/PreguntaCardFIB.tsx
// Tarjeta de admin para preguntas fill_in_multiple_blanks con items[].
// Muestra el grid de blancos con ⚙️ por ítem para editar individualmente.
import { useState } from "react";
import {
  Typography, Chip, IconButton, Tooltip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Alert,
} from "@mui/material";
import SettingsIcon      from "@mui/icons-material/Settings";
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import CheckIcon         from "@mui/icons-material/Check";
import GridViewIcon      from "@mui/icons-material/GridView";
import { useAppDispatch } from "@/store/hooks";
import { editarItemFIB, editarPregunta } from "@/store/slices/quiz";
import type { IPregunta, IItemFIB } from "@/store/slices/quiz/quizSlice";
import { renderLatexInHtml } from "@/components/CKEditor/mathUtils";

// ─── Tipos de validación LTI disponibles ─────────────────────────────────────

const TIPOS_PIMU = [
  { value: "numero",          label: "Número" },
  { value: "formula",         label: "Fórmula" },
  { value: "antiderivada",    label: "Antiderivada" },
  { value: "conjunto",        label: "Conjunto" },
  { value: "intervalo",       label: "Intervalo" },
  { value: "ecuacion",        label: "Ecuación" },
  { value: "punto",           label: "Punto" },
  { value: "factorizacion",   label: "Factorización" },
  { value: "vector",          label: "Vector" },
];

// ─── Helper KaTeX ─────────────────────────────────────────────────────────────

const Latex = ({ html, className }: { html: string; className?: string }) => (
  <span className={className} dangerouslySetInnerHTML={{ __html: renderLatexInHtml(html) }} />
);

// ─── Modal editar ítem individual ─────────────────────────────────────────────

interface ModalItemProps {
  pregunta: IPregunta;
  item:     IItemFIB;
  onClose:  () => void;
}

const ModalEditarItem = ({ pregunta, item, onClose }: ModalItemProps) => {
  const dispatch = useAppDispatch();

  const [enunciado, setEnunciado] = useState(item.enunciado);
  const [respuesta, setRespuesta] = useState(item.respuesta);
  const [tipoPimu,  setTipoPimu]  = useState(item.tipo_pimu);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleGuardar = async () => {
    if (!respuesta.trim()) { setError("La respuesta no puede estar vacía"); return; }
    setError(null);
    setGuardando(true);
    const result = await dispatch(editarItemFIB({
      pregunta_id: pregunta._id,
      item_id:     item.id,
      enunciado:   enunciado.trim(),
      respuesta:   respuesta.trim(),
      tipo_pimu:   tipoPimu,
    })) as unknown as { ok: boolean; msg?: string };
    setGuardando(false);
    if (result.ok) onClose();
    else setError(result.msg ?? "Error al guardar");
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1e293b", pb: 1 }}>
        Editar blanco — <span style={{ color: "#2d5be3" }}>[{item.id}]</span>
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <TextField
          label="Enunciado del ítem (LaTeX permitido)"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          multiline minRows={2} fullWidth size="small"
          helperText="Dejar vacío si el enunciado es el contexto general de la pregunta"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        <TextField
          label="Respuesta esperada"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          fullWidth size="small" required
          helperText="Ej: atan(e^x)+C  |  sqrt(1+x^2)  |  1/2"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Tipo de validación LTI</InputLabel>
          <Select
            value={tipoPimu}
            label="Tipo de validación LTI"
            onChange={(e) => setTipoPimu(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {TIPOS_PIMU.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Preview KaTeX del enunciado */}
        {enunciado.trim() && (
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mb: 1 }}>
              Preview
            </Typography>
            <Latex html={enunciado} className="text-sm text-[#1e293b]" />
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} variant="contained" disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
          sx={{ bgcolor: "#2d5be3", borderRadius: 2, fontWeight: 600, boxShadow: "none",
            "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Modal editar contexto + columnas de la pregunta FIB ──────────────────────

interface ModalContextoProps {
  pregunta: IPregunta;
  onClose:  () => void;
}

const ModalEditarContexto = ({ pregunta, onClose }: ModalContextoProps) => {
  const dispatch = useAppDispatch();

  const [contexto,  setContexto]  = useState(pregunta.enunciado_contexto);
  const [columnas,  setColumnas]  = useState<number>(pregunta.columnas ?? 1);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleGuardar = async () => {
    setError(null);
    setGuardando(true);
    const result = await dispatch(editarPregunta({
      pregunta_id:        pregunta._id,
      enunciado:          contexto.trim(),
      enunciado_contexto: contexto.trim(),
      columnas,
    })) as unknown as { ok: boolean; msg?: string };
    setGuardando(false);
    if (result.ok) onClose();
    else setError(result.msg ?? "Error al guardar");
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#1e293b", pb: 1 }}>
        Editar contexto y columnas
      </DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        <TextField
          label="Enunciado de contexto (texto introductorio)"
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          multiline minRows={3} fullWidth size="small"
          helperText="Instrucción general que aparece sobre todos los blancos"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        <FormControl size="small" fullWidth>
          <InputLabel>Columnas del grid</InputLabel>
          <Select
            value={columnas}
            label="Columnas del grid"
            onChange={(e) => setColumnas(Number(e.target.value))}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value={1}>1 columna</MenuItem>
            <MenuItem value={2}>2 columnas</MenuItem>
            <MenuItem value={3}>3 columnas</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} variant="contained" disabled={guardando}
          startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
          sx={{ bgcolor: "#2d5be3", borderRadius: 2, fontWeight: 600, boxShadow: "none",
            "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Componente principal: tarjeta FIB ───────────────────────────────────────

interface Props {
  pregunta: IPregunta;
}

const PreguntaCardFIB = ({ pregunta }: Props) => {
  const [modalItem,     setModalItem]     = useState<IItemFIB | null>(null);
  const [modalContexto, setModalContexto] = useState(false);

  const colClass =
    (pregunta.columnas ?? 1) === 3 ? "grid-cols-3" :
    (pregunta.columnas ?? 1) === 2 ? "grid-cols-2" :
    "grid-cols-1";

  return (
    <>
      {/* ── Header de la tarjeta ── */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip label="Completar (LTI)" size="small"
            sx={{ bgcolor: "#eef3fb", color: "#2d5be3", fontWeight: 600, fontSize: "0.65rem" }} />
          <Chip label={`${pregunta.puntos} pt${pregunta.puntos !== 1 ? "s" : ""}`} size="small"
            sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontSize: "0.65rem" }} />
          <Chip
            icon={<GridViewIcon sx={{ fontSize: 12 }} />}
            label={`${pregunta.columnas ?? 1} col`} size="small"
            sx={{ bgcolor: "#f0fdf4", color: "#16a34a", fontSize: "0.65rem" }} />
        </div>
        {/* ⚙️ editar contexto + columnas */}
        <Tooltip title="Editar contexto y columnas">
          <IconButton size="small" onClick={() => setModalContexto(true)}
            sx={{ color: "#94a3b8", "&:hover": { color: "#2d5be3", bgcolor: "#eef3fb" } }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* ── Enunciado de contexto ── */}
      {pregunta.enunciado_contexto && (
        <div className="mb-4 text-[#1e293b] text-sm leading-relaxed px-1">
          <Latex html={pregunta.enunciado_contexto} />
        </div>
      )}

      {/* ── Grid de ítems ── */}
      <div className={`grid ${colClass} gap-3`}>
        {pregunta.items.map((item, idx) => (
          <div key={item.id}
            className="rounded-xl border border-[#d9e4ee] bg-[#f8fafc] p-4 flex flex-col gap-3 relative group">

            {/* Número + enunciado */}
            <div className="flex items-start gap-1.5">
              <span className="text-[#2d5be3] font-bold text-sm min-w-[1.2rem]">{idx + 1}.</span>
              <div className="text-sm text-[#1e293b] leading-relaxed flex-1 min-w-0">
                {item.enunciado
                  ? <Latex html={item.enunciado} />
                  : <span className="text-[#94a3b8] italic text-xs">(usa el contexto general)</span>
                }
              </div>
            </div>

            {/* Input placeholder (admin ve el diseño del formulario) */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs text-[#94a3b8]">
                Ingrese su respuesta
              </div>
              <Tooltip title={`Validación: ${item.tipo_pimu}`}>
                <IconButton size="small" onClick={() => setModalItem(item)}
                  sx={{ color: "#64748b", "&:hover": { color: "#2d5be3", bgcolor: "#eef3fb" } }}>
                  <SettingsIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>

            {/* Badge tipo validación */}
            <div className="flex items-center gap-1">
              <Typography variant="caption" sx={{ color: "#2d5be3", fontWeight: 600, fontSize: "0.6rem" }}>
                Validación LTI:
              </Typography>
              <Chip
                label={TIPOS_PIMU.find((t) => t.value === item.tipo_pimu)?.label ?? item.tipo_pimu}
                size="small"
                sx={{ bgcolor: "#eef3fb", color: "#2d5be3", fontWeight: 600, fontSize: "0.6rem", height: 18 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Modales ── */}
      {modalItem && (
        <ModalEditarItem
          pregunta={pregunta}
          item={modalItem}
          onClose={() => setModalItem(null)}
        />
      )}
      {modalContexto && (
        <ModalEditarContexto
          pregunta={pregunta}
          onClose={() => setModalContexto(false)}
        />
      )}
    </>
  );
};

export default PreguntaCardFIB;