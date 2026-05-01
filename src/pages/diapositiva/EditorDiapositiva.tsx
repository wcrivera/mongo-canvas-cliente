// src/pages/diapositiva/EditorDiapositiva.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate }                   from "react-router-dom";
import {
  Button, Typography, CircularProgress, IconButton,
  Tooltip, Chip, Alert, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon          from "@mui/icons-material/ArrowBack";
import AddIcon                from "@mui/icons-material/Add";
import DeleteOutlineIcon      from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowUpwardIcon        from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon      from "@mui/icons-material/ArrowDownward";
import VisibilityIcon         from "@mui/icons-material/Visibility";
import SettingsIcon           from "@mui/icons-material/Settings";
import CheckIcon              from "@mui/icons-material/Check";
import CloudUploadIcon        from "@mui/icons-material/CloudUpload";
import ViewColumnIcon         from "@mui/icons-material/ViewColumn";
import CloseIcon              from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { agregarDiapositiva, actualizarDiapositiva } from "../../store/slices/diapositiva";
import { fetchConToken }      from "../../helpers/fetch";
import MathTextEditor         from "../../components/CKEditor/MathTextEditor";
import { compilarHtmlMiniatura } from "./compilarHtmlReveal";
import {
  COMPONENTES_LABELS,
  COMPONENTES_COLORS,
  htmlComponente,
  type ComponenteMatematico,
} from "./revealStyles";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Layout =
  | "titulo"
  | "titulo_contenido"
  | "dos_columnas"
  | "titulo_imagen"
  | "codigo"
  | "definicion"
  | "libre";

export interface ISlide {
  id:                 string;
  pagina:             number;
  layout:             Layout;
  titulo:             string;
  contenido:          string;
  contenido_derecho?: string;
  notas?:             string;
  fondo?:             string;
}

export interface IConfigReveal {
  tema:       string;
  transicion: string;
  menu:       boolean;
}

const LAYOUTS: { value: Layout; label: string; icon: string }[] = [
  { value: "titulo",           label: "Solo título",        icon: "T"   },
  { value: "titulo_contenido", label: "Título + contenido", icon: "☰"  },
  { value: "dos_columnas",     label: "Dos columnas",       icon: "⊞"  },
  { value: "titulo_imagen",    label: "Título + imagen",    icon: "🖼"   },
  { value: "codigo",           label: "Código",             icon: "</>" },
  { value: "libre",            label: "Libre",              icon: "✦"   },
];

const TEMAS        = ["beige", "white", "black", "moon", "sky", "league", "solarized"];
const TRANSICIONES = ["slide", "fade", "zoom", "convex", "concave", "none"];

const COMPONENTES: ComponenteMatematico[] = [
  "definicion", "teorema", "proposicion", "corolario",
  "lema", "ejemplo", "demostracion", "observacion",
];

const uid = () => Math.random().toString(36).slice(2, 9);

const slideVacio = (pagina: number): ISlide => ({
  id:       uid(),
  pagina,
  layout:   "titulo_contenido",
  titulo:   "",
  contenido:"",
  notas:    "",
  fondo:    "",
});

// ─────────────────────────────────────────────────────────────────────────────

const EditorDiapositiva = () => {
  const { recurso_id } = useParams<{
    recurso_id: string;
  }>();
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const siglaCurso = useAppSelector(s => s.mongoCurso.cursoActivo?.codigo ?? "");

  const [slides,        setSlides]       = useState<ISlide[]>([slideVacio(1)]);
  const [slideActivo,   setSlideActivo]  = useState(0);
  const [config,        setConfig]       = useState<IConfigReveal>({
    tema: "beige", transicion: "slide", menu: true,
  });
  const [cargando,      setCargando]     = useState(true);
  const [guardando,     setGuardando]    = useState(false);
  const [publicando,    setPublicando]   = useState(false);
  const [msgOk,         setMsgOk]        = useState<string | null>(null);
  const [msgErr,        setMsgErr]       = useState<string | null>(null);
  const [modalConfig,   setModalConfig]  = useState(false);
  const [modalPreview,  setModalPreview] = useState<number | null>(null);

  const inicializado = useRef(false);
  const diapId       = useRef<string | null>(null);

  // ── Cargar ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!recurso_id || inicializado.current) return;

    const cargar = async () => {
      setCargando(true);
      try {
        const resp = await fetchConToken(`api/diapositivas/recurso/${recurso_id}`);
        const body = await resp.json();

        if (body.ok && body.data) {
          const d = body.data;
          diapId.current = d._id;
          dispatch(agregarDiapositiva(d));

          if (d.slides && d.slides.length > 0) {
            setSlides(
              (d.slides as ISlide[]).map((s: ISlide, i: number) => ({
                ...s, id: s.id ?? uid(), pagina: i + 1,
              })),
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const savedConfig = (d as any).config as IConfigReveal | undefined;
          if (savedConfig) setConfig(savedConfig);
        } else {
          const respCrear = await fetchConToken(
            "api/diapositivas",
            { recurso_id, url: "" },
            "POST",
          );
          const bodyCrear = await respCrear.json();
          if (bodyCrear.ok && bodyCrear.data) {
            diapId.current = bodyCrear.data._id;
            dispatch(agregarDiapositiva(bodyCrear.data));
          }
        }
      } catch (e) {
        console.error("[EditorDiapositiva] error al cargar:", e);
      } finally {
        inicializado.current = true;
        setCargando(false);
      }
    };

    cargar();
  }, [recurso_id, dispatch]);

  // ── CRUD slides ───────────────────────────────────────────────────────────

  const agregarSlide = () => {
    const nuevo = slideVacio(slides.length + 1);
    setSlides((prev) => [...prev, nuevo]);
    setSlideActivo(slides.length);
  };

  const eliminarSlide = (idx: number) => {
    if (slides.length === 1) return;
    setSlides((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, pagina: i + 1 })),
    );
    setSlideActivo((prev) => Math.min(prev, slides.length - 2));
  };

  const moverSlide = (idx: number, dir: -1 | 1) => {
    const next    = [...slides];
    const destino = idx + dir;
    if (destino < 0 || destino >= next.length) return;
    [next[idx], next[destino]] = [next[destino], next[idx]];
    next.forEach((s, i) => { s.pagina = i + 1; });
    setSlides(next);
    setSlideActivo(destino);
  };

  const actualizarSlide = useCallback((campo: keyof ISlide, valor: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === slideActivo ? { ...s, [campo]: valor } : s)),
    );
  }, [slideActivo]);

  // ── Insertar componente matemático ────────────────────────────────────────
  const insertarComponente = (tipo: ComponenteMatematico) => {
    const html   = htmlComponente(tipo, "", "<p>Escribe aquí...</p>");
    const actual = slides[slideActivo]?.contenido ?? "";
    actualizarSlide("contenido", actual + html);
  };

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!diapId.current) return;
    setGuardando(true);
    setMsgErr(null);
    const resp = await fetchConToken(
      `api/diapositivas/${diapId.current}/slides`,
      { slides, config },
      "PATCH",
    );
    const body = await resp.json();
    setGuardando(false);
    if (body.ok) {
      dispatch(actualizarDiapositiva(body.data));
      setMsgOk("Guardado");
      setTimeout(() => setMsgOk(null), 2500);
    } else {
      setMsgErr(body.msg ?? "Error al guardar");
    }
  };

  // ── Publicar ──────────────────────────────────────────────────────────────
  const handlePublicar = async () => {
    if (!diapId.current) return;
    setPublicando(true);
    setMsgErr(null);
    await handleGuardar();
    const resp = await fetchConToken(
      `api/diapositivas/${diapId.current}/publicar`,
      {},
      "POST",
    );
    const body = await resp.json();
    setPublicando(false);
    if (body.ok) {
      setMsgOk("✓ Publicado en Canvas");
      setTimeout(() => setMsgOk(null), 3000);
    } else {
      setMsgErr(body.msg ?? "Error al publicar");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress sx={{ color: "#f47c3c" }} />
      </div>
    );
  }

  const slide = slides[slideActivo];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#f0f4f8" }}>

      {/* ── Topbar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: "#f47c3c", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>

        <IconButton size="small" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600, flex: 1 }}>
          Editor de Diapositivas
        </Typography>

        <div className="flex items-center gap-2">
          {msgOk && (
            <Chip
              icon={<CheckIcon sx={{ fontSize: "14px !important", color: "white !important" }} />}
              label={msgOk}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, height: 24 }}
            />
          )}

          <Tooltip title="Configuración de la presentación">
            <IconButton size="small" onClick={() => setModalConfig(true)}
              sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "white" } }}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button variant="outlined" size="small" onClick={handleGuardar}
            disabled={guardando || !diapId.current}
            startIcon={guardando ? <CircularProgress size={12} color="inherit" /> : undefined}
            sx={{ borderColor: "rgba(255,255,255,0.6)", color: "white", borderRadius: 2, fontSize: 12,
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>

          <Button variant="contained" size="small" onClick={handlePublicar}
            disabled={publicando || !diapId.current}
            startIcon={publicando
              ? <CircularProgress size={12} color="inherit" />
              : <CloudUploadIcon sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: "white", color: "#f47c3c", borderRadius: 2, fontSize: 12,
              fontWeight: 700, boxShadow: "none",
              "&:hover": { bgcolor: "#fff5ef", boxShadow: "none" } }}>
            {publicando ? "Publicando..." : "Publicar en Canvas"}
          </Button>
        </div>
      </div>

      {msgErr && (
        <Alert severity="error" onClose={() => setMsgErr(null)} sx={{ borderRadius: 0 }}>
          {msgErr}
        </Alert>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Panel izquierdo: lista de slides ── */}
        <div className="flex flex-col gap-2 p-3 overflow-y-auto"
          style={{ width: 160, background: "white", borderRight: "1px solid #e2e8f0", minHeight: 0 }}>

          {slides.map((s, idx) => (
            <div key={s.id}
              onClick={() => setSlideActivo(idx)}
              style={{
                borderRadius: 8, overflow: "hidden", cursor: "pointer",
                border: idx === slideActivo ? "2px solid #f47c3c" : "2px solid transparent",
                position: "relative",
              }}>

              {/* Miniatura */}
              <div style={{ aspectRatio: "16/9", background: "#f8fafc", overflow: "hidden" }}>
                <iframe
                  srcDoc={compilarHtmlMiniatura([s], config)}
                  style={{ width: "400%", height: "400%", transform: "scale(0.25)", transformOrigin: "0 0",
                    border: "none", pointerEvents: "none" }}
                  title={`slide-${idx}`}
                />
              </div>

              {/* Número + controles */}
              <div className="flex items-center justify-between px-1.5 py-1"
                style={{ background: idx === slideActivo ? "#fff5ef" : "#f8fafc" }}>
                <Typography variant="caption" sx={{ color: idx === slideActivo ? "#f47c3c" : "#94a3b8", fontWeight: 600 }}>
                  {idx + 1}
                </Typography>
                <div className="flex gap-0.5">
                  <Tooltip title="Vista previa">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setModalPreview(idx); }}
                      sx={{ color: "#8daecb", p: 0.3 }}>
                      <VisibilityIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Subir">
                    <span>
                      <IconButton size="small" disabled={idx === 0} onClick={(e) => { e.stopPropagation(); moverSlide(idx, -1); }}
                        sx={{ color: "#8daecb", p: 0.3, "&:disabled": { color: "#e2e8f0" } }}>
                        <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Bajar">
                    <span>
                      <IconButton size="small" disabled={idx === slides.length - 1} onClick={(e) => { e.stopPropagation(); moverSlide(idx, 1); }}
                        sx={{ color: "#8daecb", p: 0.3, "&:disabled": { color: "#e2e8f0" } }}>
                        <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton size="small" disabled={slides.length === 1} onClick={(e) => { e.stopPropagation(); eliminarSlide(idx); }}
                        sx={{ color: "#8daecb", p: 0.3, "&:disabled": { color: "#e2e8f0" }, "&:hover": { color: "#ef4444" } }}>
                        <DeleteOutlineIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}

          <Button size="small" startIcon={<AddIcon />} onClick={agregarSlide}
            sx={{ color: "#f47c3c", borderColor: "#f47c3c", borderRadius: 2, mt: 1,
              border: "1.5px dashed", "&:hover": { bgcolor: "#fff5ef" } }}>
            Slide
          </Button>
        </div>

        {/* ── Panel derecho: editor ── */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ minHeight: 0 }}>

          {/* Layout selector */}
          <div className="flex flex-wrap gap-2">
            {LAYOUTS.map((l) => (
              <button key={l.value} onClick={() => actualizarSlide("layout", l.value)}
                style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 12,
                  border: slide.layout === l.value ? "1.5px solid #f47c3c" : "1.5px solid #e2e8f0",
                  background: slide.layout === l.value ? "#fff5ef" : "white",
                  color: slide.layout === l.value ? "#f47c3c" : "#64748b",
                  cursor: "pointer", fontWeight: slide.layout === l.value ? 600 : 400,
                }}>
                {l.icon} {l.label}
              </button>
            ))}
          </div>

          {/* Título */}
          {slide.layout !== "libre" && (
            <div>
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
                TÍTULO
              </Typography>
              <input
                value={slide.titulo}
                onChange={(e) => actualizarSlide("titulo", e.target.value)}
                placeholder="Título del slide..."
                style={{
                  width: "100%", border: "none",
                  borderBottom: "1.5px solid #e2e8f0", outline: "none",
                  fontSize: 18, fontWeight: 600, color: "#1e293b",
                  padding: "6px 0", background: "transparent", marginTop: 4,
                }}
                onFocus={(e) => (e.target.style.borderBottomColor = "#f47c3c")}
                onBlur={(e)  => (e.target.style.borderBottomColor = "#e2e8f0")}
              />
            </div>
          )}

          {/* Contenido principal */}
          {(slide.layout === "titulo_contenido" ||
            slide.layout === "dos_columnas"     ||
            slide.layout === "definicion"       ||
            slide.layout === "libre") && (
            <div>
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
                {slide.layout === "dos_columnas" ? "COLUMNA IZQUIERDA" : "CONTENIDO"}
              </Typography>
              <div style={{ marginTop: 4 }}>
                <MathTextEditor
                  key={`contenido-${slide.id}-${slideActivo}`}
                  initialData={slide.contenido}
                  onChange={(html) => actualizarSlide("contenido", html)}
                  siglaCurso={siglaCurso}
                />
              </div>
            </div>
          )}

          {/* Columna derecha */}
          {slide.layout === "dos_columnas" && (
            <div>
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
                COLUMNA DERECHA
              </Typography>
              <div style={{ marginTop: 4 }}>
                <MathTextEditor
                  key={`contenido_derecho-${slide.id}-${slideActivo}`}
                  initialData={slide.contenido_derecho ?? ""}
                  onChange={(html) => actualizarSlide("contenido_derecho", html)}
                  siglaCurso={siglaCurso}
                />
              </div>
            </div>
          )}

          {/* Código */}
          {slide.layout === "codigo" && (
            <div>
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
                CÓDIGO
              </Typography>
              <textarea
                value={slide.contenido}
                onChange={(e) => actualizarSlide("contenido", e.target.value)}
                placeholder="// Escribe tu código aquí..."
                style={{
                  width: "100%", minHeight: 180, border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "12px", fontFamily: "monospace",
                  fontSize: 13, color: "#1e293b", background: "#f8fafc",
                  resize: "vertical", outline: "none", marginTop: 4,
                }}
              />
            </div>
          )}

          {/* Componentes matemáticos */}
          {(slide.layout === "titulo_contenido" || slide.layout === "libre" || slide.layout === "definicion") && (
            <div>
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 0.5 }}>
                <ViewColumnIcon sx={{ fontSize: 13 }} /> INSERTAR COMPONENTE
              </Typography>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMPONENTES.map((tipo) => (
                  <button key={tipo} onClick={() => insertarComponente(tipo)}
                    style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                      border: `1.5px solid ${COMPONENTES_COLORS[tipo]}40`,
                      background: `${COMPONENTES_COLORS[tipo]}10`,
                      color: COMPONENTES_COLORS[tipo], fontWeight: 500,
                    }}>
                    {COMPONENTES_LABELS[tipo]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fondo */}
          <div>
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
              FONDO (color opcional)
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <input type="color"
                value={slide.fondo || "#ffffff"}
                onChange={(e) => actualizarSlide("fondo", e.target.value === "#ffffff" ? "" : e.target.value)}
                style={{ width: 32, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }}
              />
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                {slide.fondo || "Por defecto"}
              </Typography>
              {slide.fondo && (
                <button onClick={() => actualizarSlide("fondo", "")}
                  style={{ fontSize: 10, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  limpiar
                </button>
              )}
            </div>
          </div>

          {/* Notas */}
          <div>
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
              NOTAS DEL PRESENTADOR
            </Typography>
            <textarea
              value={slide.notas ?? ""}
              onChange={(e) => actualizarSlide("notas", e.target.value)}
              placeholder="Notas visibles solo en modo presentador (tecla S)..."
              style={{
                width: "100%", minHeight: 70, border: "1px solid #e2e8f0",
                borderRadius: 8, padding: "10px 12px", fontSize: 12,
                color: "#475569", background: "#f8fafc", resize: "none",
                outline: "none", marginTop: 4, fontFamily: "inherit",
              }}
            />
          </div>

        </div>
      </div>

      {/* ── Modal configuración ── */}
      <Dialog open={modalConfig} onClose={() => setModalConfig(false)} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ bgcolor: "#f47c3c", color: "white", py: 1.5, px: 3, fontSize: 15, fontWeight: 600 }}>
          Configuración de la presentación
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Tema visual</InputLabel>
            <Select value={config.tema} label="Tema visual"
              onChange={(e) => setConfig((c) => ({ ...c, tema: e.target.value }))}
              sx={{ borderRadius: 2 }}>
              {TEMAS.map((t) => (
                <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Transición</InputLabel>
            <Select value={config.transicion} label="Transición"
              onChange={(e) => setConfig((c) => ({ ...c, transicion: e.target.value }))}
              sx={{ borderRadius: 2 }}>
              {TRANSICIONES.map((t) => (
                <MenuItem key={t} value={t} sx={{ textTransform: "capitalize" }}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="menu-reveal" checked={config.menu}
              onChange={(e) => setConfig((c) => ({ ...c, menu: e.target.checked }))}
              style={{ accentColor: "#f47c3c", width: 16, height: 16 }}
            />
            <label htmlFor="menu-reveal" style={{ fontSize: 14, color: "#374151", cursor: "pointer" }}>
              Mostrar menú de navegación
            </label>
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalConfig(false)} variant="contained"
            sx={{ bgcolor: "#f47c3c", borderRadius: 2, boxShadow: "none", "&:hover": { bgcolor: "#e06b2e", boxShadow: "none" } }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal preview ── */}
      {modalPreview !== null && (
        <Dialog open onClose={() => setModalPreview(null)} maxWidth="md" fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
          <DialogTitle sx={{ bgcolor: "#1e293b", color: "white", py: 1.5, px: 3, fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Vista previa — Slide {modalPreview + 1}</span>
            <IconButton size="small" onClick={() => setModalPreview(null)} sx={{ color: "rgba(255,255,255,0.7)" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, aspectRatio: "16/9", background: "#000" }}>
            <iframe
              srcDoc={compilarHtmlMiniatura([slides[modalPreview]], config)}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              title="preview"
            />
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default EditorDiapositiva;