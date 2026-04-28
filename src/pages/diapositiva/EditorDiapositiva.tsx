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
import SlideshowIcon          from "@mui/icons-material/Slideshow";
import SettingsIcon           from "@mui/icons-material/Settings";
import CheckIcon              from "@mui/icons-material/Check";
import CloudUploadIcon        from "@mui/icons-material/CloudUpload";
import ViewColumnIcon         from "@mui/icons-material/ViewColumn";
import CloseIcon              from "@mui/icons-material/Close";
import { useAppDispatch }     from "../../store/hooks";
import { agregarDiapositiva, actualizarDiapositiva } from "../../store/slices/diapositiva";
import { fetchConToken }      from "../../helpers/fetch";
import { LatexEditor }        from "../../components/Editor";
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

// Componentes matemáticos disponibles en la toolbar
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
  const { curso_id, capitulo_id, recurso_id } = useParams<{
    curso_id:    string;
    capitulo_id: string;
    clase_id:    string;
    recurso_id:  string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
          // No existe → crear
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

  // ── Insertar componente matemático en el editor ───────────────────────────
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

  const slide = slides[slideActivo];

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f0f4f8] flex-col gap-3">
        <CircularProgress sx={{ color: "#f47c3c" }} />
        <Typography variant="body2" sx={{ color: "#6793ba" }}>Cargando diapositiva...</Typography>
      </div>
    );
  }

  // ── HTML de una sola slide para miniatura ─────────────────────────────────
  const htmlSlide = (idx: number) =>
    compilarHtmlMiniatura([{ ...slides[idx], pagina: 1 }], config);

  return (
    <div className="flex flex-col h-screen bg-[#f0f4f8] overflow-hidden">

      {/* ── Top bar ── */}
      <div style={{ background: "#f47c3c", flexShrink: 0 }}
        className="flex items-center justify-between px-4 py-2 gap-3">

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/clases`)}
          size="small"
          sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem",
            "&:hover": { color: "white", bgcolor: "transparent" }, minWidth: 0 }}
        >
          Clases
        </Button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <SlideshowIcon sx={{ color: "white", fontSize: 18 }} />
          <Typography variant="body2" sx={{ color: "white", fontWeight: 600, fontSize: 14 }}>
            Editor de diapositivas
          </Typography>
          <Chip
            label={`${slides.length} slide${slides.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, height: 20 }}
          />
        </div>

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

        {/* ── Panel izquierdo: miniaturas ── */}
        <div style={{ width: 200, background: "#1e293b", flexShrink: 0,
          display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div className="flex items-center justify-between px-3 py-2">
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 10, letterSpacing: "0.08em" }}>
              SLIDES
            </Typography>
            <Tooltip title="Agregar slide">
              <IconButton size="small" onClick={agregarSlide}
                sx={{ color: "rgba(255,255,255,0.6)", p: 0.3, "&:hover": { color: "white" } }}>
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </div>

          <div className="flex-1 overflow-y-auto pb-3 flex flex-col gap-2 px-2">
            {slides.map((s, idx) => (
              <div key={s.id}
                style={{
                  borderRadius: 8,
                  border: idx === slideActivo
                    ? "2px solid #f47c3c"
                    : "1.5px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  cursor: "pointer",
                  background: "#0f172a",
                  flexShrink: 0,
                }}
                onClick={() => setSlideActivo(idx)}
              >
                {/* Miniatura — iframe escalado */}
                <div style={{ position: "relative", paddingTop: "56.25%", background: "#0f172a" }}>
                  <iframe
                    key={`mini-${s.id}-${s.titulo}-${s.contenido?.slice(0,20)}`}
                    srcDoc={htmlSlide(idx)}
                    style={{
                      position: "absolute", top: 0, left: 0,
                      width: "960px", height: "540px",
                      border: "none",
                      transform: "scale(0.183)",
                      transformOrigin: "top left",
                      pointerEvents: "none",
                    }}
                    sandbox="allow-scripts"
                    title={`Slide ${idx + 1}`}
                  />
                </div>

                {/* Controles */}
                <div className="flex items-center justify-between px-1.5 py-1"
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: "rgba(0,0,0,0.3)" }}>
                  <Typography variant="caption"
                    sx={{ color: idx === slideActivo ? "#f47c3c" : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600 }}>
                    {idx + 1}
                  </Typography>
                  <div className="flex gap-0.5">
                    <Tooltip title="Ver en grande">
                      <IconButton size="small" onClick={() => setModalPreview(idx)}
                        sx={{ color: "rgba(255,255,255,0.5)", p: 0.2, "&:hover": { color: "white" } }}>
                        <VisibilityIcon sx={{ fontSize: 11 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Subir">
                      <span>
                        <IconButton size="small" disabled={idx === 0}
                          onClick={() => moverSlide(idx, -1)}
                          sx={{ color: "rgba(255,255,255,0.4)", p: 0.2, "&:hover": { color: "white" },
                            "&.Mui-disabled": { opacity: 0.15 } }}>
                          <ArrowUpwardIcon sx={{ fontSize: 11 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Bajar">
                      <span>
                        <IconButton size="small" disabled={idx === slides.length - 1}
                          onClick={() => moverSlide(idx, 1)}
                          sx={{ color: "rgba(255,255,255,0.4)", p: 0.2, "&:hover": { color: "white" },
                            "&.Mui-disabled": { opacity: 0.15 } }}>
                          <ArrowDownwardIcon sx={{ fontSize: 11 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <span>
                        <IconButton size="small" disabled={slides.length === 1}
                          onClick={() => eliminarSlide(idx)}
                          sx={{ color: "rgba(255,255,255,0.4)", p: 0.2, "&:hover": { color: "#ef4444" },
                            "&.Mui-disabled": { opacity: 0.15 } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 11 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Editor central — ocupa todo el espacio restante ── */}
        <div style={{ flex: 1, background: "white",
          display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header editor */}
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2">
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
              Slide {slideActivo + 1}
            </Typography>
            <FormControl size="small" sx={{ minWidth: 155 }}>
              <InputLabel sx={{ fontSize: 12 }}>Layout</InputLabel>
              <Select
                value={slide?.layout ?? "titulo_contenido"}
                label="Layout"
                onChange={(e) => actualizarSlide("layout", e.target.value)}
                sx={{ fontSize: 12, borderRadius: 2 }}
              >
                {LAYOUTS.map((l) => (
                  <MenuItem key={l.value} value={l.value} sx={{ fontSize: 12 }}>
                    <span style={{ marginRight: 8, fontFamily: "monospace" }}>{l.icon}</span>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Toolbar componentes matemáticos */}
          <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1">
            <Tooltip title="Insertar dos columnas">
              <button
                onClick={() => actualizarSlide("layout", "dos_columnas")}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500,
                  background: "#f1f5f9", border: "1px solid #e2e8f0",
                  color: "#475569", cursor: "pointer",
                }}
              >
                <ViewColumnIcon sx={{ fontSize: 13 }} /> 2 col
              </button>
            </Tooltip>

            {COMPONENTES.map((tipo) => (
              <Tooltip key={tipo} title={`Insertar ${COMPONENTES_LABELS[tipo]}`}>
                <button
                  onClick={() => insertarComponente(tipo)}
                  style={{
                    padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
                    background: `${COMPONENTES_COLORS[tipo]}12`,
                    border:     `1px solid ${COMPONENTES_COLORS[tipo]}40`,
                    color:      COMPONENTES_COLORS[tipo],
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  {COMPONENTES_LABELS[tipo]}
                </button>
              </Tooltip>
            ))}
          </div>

          {/* Campos del slide */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {slide && (
              <>
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
                    <div style={{ marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                      <LatexEditor
                        key={`contenido-${slide.id}-${slideActivo}`}
                        initialContent={slide.contenido}
                        onChange={(html) => actualizarSlide("contenido", html)}
                        minHeight="160px"
                        placeholder="Contenido del slide... usa f(x) para LaTeX"
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
                    <div style={{ marginTop: 4, border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                      <LatexEditor
                        key={`contenido_derecho-${slide.id}-${slideActivo}`}
                        initialContent={slide.contenido_derecho ?? ""}
                        onChange={(html) => actualizarSlide("contenido_derecho", html)}
                        minHeight="160px"
                        placeholder="Contenido columna derecha..."
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
              </>
            )}
          </div>
        </div>

        {/* fin editor */}
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
            sx={{ bgcolor: "#f47c3c", borderRadius: 2, boxShadow: "none",
              "&:hover": { bgcolor: "#e06020", boxShadow: "none" } }}>
            Listo
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal preview slide en grande ── */}
      {modalPreview !== null && (
        <Dialog open onClose={() => setModalPreview(null)} maxWidth="lg" fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3, bgcolor: "#0f172a", overflow: "hidden" } } }}>
          <div className="flex items-center justify-between px-4 py-2">
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              Slide {modalPreview + 1} de {slides.length}
            </Typography>
            <div className="flex items-center gap-1">
              <Tooltip title="Anterior">
                <span>
                  <IconButton size="small" disabled={modalPreview === 0}
                    onClick={() => setModalPreview((p) => (p ?? 0) - 1)}
                    sx={{ color: "rgba(255,255,255,0.5)", "&.Mui-disabled": { opacity: 0.2 } }}>
                    <ArrowUpwardIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Siguiente">
                <span>
                  <IconButton size="small" disabled={modalPreview === slides.length - 1}
                    onClick={() => setModalPreview((p) => (p ?? 0) + 1)}
                    sx={{ color: "rgba(255,255,255,0.5)", "&.Mui-disabled": { opacity: 0.2 } }}>
                    <ArrowDownwardIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <IconButton size="small" onClick={() => setModalPreview(null)}
                sx={{ color: "rgba(255,255,255,0.6)", "&:hover": { color: "white" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>
          <div style={{ padding: "0 16px 16px" }}>
            <iframe
              srcDoc={htmlSlide(modalPreview)}
              style={{ width: "100%", height: "540px", border: "none", borderRadius: 8 }}
              sandbox="allow-scripts"
              title={`Preview slide ${modalPreview + 1}`}
            />
          </div>
        </Dialog>
      )}

    </div>
  );
};

export default EditorDiapositiva;