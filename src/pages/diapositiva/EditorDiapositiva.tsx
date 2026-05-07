// src/pages/diapositiva/EditorDiapositiva.tsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { actualizarDiapositiva, eliminarDiapositiva } from "../../store/slices/diapositiva";
import { fetchConToken } from "../../helpers/fetch";
import MathTextEditor from "../../components/CKEditor/MathTextEditorDiapositiva";
import SlidePreview from "./SlidePreview"; // mismo directorio: src/pages/diapositiva/

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Layout =
  | "titulo_contenido"
  | "dos_columnas"
  | "titulo_imagen"
  | "codigo"
  | "libre";

export interface ISlide {
  id: string;
  pagina: number;
  layout: Layout;
  contenido: string;
  contenido_derecho?: string;
  notas?: string;
  fondo?: string;
}

export interface IConfigReveal {
  tema: string;
  transicion: string;
  menu: boolean;
}

const TEMAS = ["beige", "white", "black", "moon", "sky", "league", "solarized"];
const TRANSICIONES = ["slide", "fade", "zoom", "convex", "concave", "none"];

const uid = () => Math.random().toString(36).slice(2, 9);

const slideVacio = (pagina: number): ISlide => ({
  id: uid(),
  pagina,
  layout: "titulo_contenido",
  contenido: "",
  notas: "",
  fondo: "",
});

// ─────────────────────────────────────────────────────────────────────────────

const EditorDiapositiva = () => {
  const { curso_id, capitulo_id, recurso_id } = useParams<{
    curso_id: string;
    capitulo_id: string;
    recurso_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const siglaCurso = useAppSelector(
    (s) => s.mongoCurso.cursoActivo?.codigo ?? "",
  );

  const [slides, setSlides] = useState<ISlide[]>([slideVacio(1)]);
  const [slideActivo, setSlideActivo] = useState(0);
  const [config, setConfig] = useState<IConfigReveal>({
    tema: "beige",
    transicion: "slide",
    menu: true,
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [msgErr, setMsgErr] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState(false);
  const [modalPreview,  setModalPreview]  = useState<number | null>(null);
  const [eliminando,    setEliminando]    = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const diapId = useRef<string | null>(null);
  const inicializado = useRef(false);

  const slide = slides[slideActivo] ?? slides[0];

  // ── Cargar ────────────────────────────────────────────────────────────────

  // recurso_id en la ruta contiene directamente el diapositiva_id
  useEffect(() => {
    if (inicializado.current || !recurso_id) return;

    const cargar = async () => {
      try {
        const resp = await fetchConToken(`api/admin/diapositivas/${recurso_id}`);
        const body = await resp.json();

        if (body.ok && body.data) {
          diapId.current = body.data._id;
          const rawSlides = (body.data.slides ?? []) as ISlide[];
          if (rawSlides.length > 0) {
            setSlides(
              rawSlides.map((s, i) => ({
                ...s,
                id: (s as ISlide & { _id?: string })._id ?? uid(),
                pagina: i + 1,
              })),
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const savedConfig = (body.data as any).config as IConfigReveal | undefined;
          if (savedConfig) setConfig(savedConfig);
        }
      } catch (e) {
        console.error("[EditorDiapositiva] error al cargar:", e);
      } finally {
        inicializado.current = true;
        setCargando(false);
      }
    };

    cargar();
  }, [recurso_id]);

  // ── CRUD slides ───────────────────────────────────────────────────────────

  const agregarSlide = () => {
    setSlides((prev) => [...prev, slideVacio(prev.length + 1)]);
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
    const next = [...slides];
    const destino = idx + dir;
    if (destino < 0 || destino >= next.length) return;
    [next[idx], next[destino]] = [next[destino], next[idx]];
    next.forEach((s, i) => {
      s.pagina = i + 1;
    });
    setSlides(next);
    setSlideActivo(destino);
  };

  const actualizarSlide = useCallback(
    (campo: keyof ISlide, valor: string) => {
      setSlides((prev) =>
        prev.map((s, i) => (i === slideActivo ? { ...s, [campo]: valor } : s)),
      );
    },
    [slideActivo],
  );

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleGuardar = async () => {
    if (!diapId.current) return;
    setGuardando(true);
    setMsgErr(null);
    
    const resp = await fetchConToken(
      `api/admin/diapositivas/${diapId.current}/slides`,
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

    // 1. Guardar primero para asegurar que los slides están en BD
    const respGuardar = await fetchConToken(
      `api/admin/diapositivas/${diapId.current}/slides`,
      { slides, config },
      "PATCH",
    );

    const bodyGuardar = await respGuardar.json();
    if (!bodyGuardar.ok) {
      setPublicando(false);
      setMsgErr("Error al guardar antes de publicar");
      return;
    }

    // 2. Publicar — el servidor obtiene el canvas_token del usuario autenticado
    const resp = await fetchConToken(
      `api/admin/diapositivas/${diapId.current}/publicar`,
      {},
      "POST",
    );

    const body = await resp.json();
    setPublicando(false);
    if (body.ok) {
      dispatch(actualizarDiapositiva(body.data));
      setMsgOk("✓ Publicado en Canvas");
      setTimeout(() => setMsgOk(null), 3000);
    } else {
      setMsgErr(body.msg ?? "Error al publicar");
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────────────

  const handleEliminar = async () => {
    if (!diapId.current) return;
    setEliminando(true);
    await dispatch(eliminarDiapositiva({ diapositiva_id: diapId.current }));
    setEliminando(false);
    navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/clases`);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#f47c3c" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconButton
            size="small"
            onClick={() =>
              navigate(`/cursos/${curso_id}/capitulos/${capitulo_id}/clases`)
            }
            sx={{ color: "#64748b" }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "#1e293b" }}
          >
            Editor de Diapositivas
          </Typography>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {msgOk && (
            <Chip
              label={msgOk}
              icon={<CheckIcon />}
              size="small"
              color="success"
            />
          )}
          {msgErr && (
            <Alert severity="error" sx={{ py: 0, fontSize: 12 }}>
              {msgErr}
            </Alert>
          )}

          <Tooltip title="Configuración">
            <IconButton
              size="small"
              onClick={() => setModalConfig(true)}
              sx={{ color: "#64748b" }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Eliminar diapositiva">
            <IconButton
              size="small"
              onClick={() => setModalEliminar(true)}
              sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            onClick={handleGuardar}
            disabled={guardando}
            sx={{
              borderColor: "#f47c3c",
              color: "#f47c3c",
              borderRadius: 2,
              "&:hover": { bgcolor: "#fff5ef", borderColor: "#f47c3c" },
            }}
          >
            {guardando ? (
              <CircularProgress size={14} sx={{ color: "#f47c3c" }} />
            ) : (
              "Guardar"
            )}
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handlePublicar}
            disabled={publicando}
            startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: "#4A6D8C",
              borderRadius: 2,
              "&:hover": { bgcolor: "#3a5a7a" },
            }}
          >
            {publicando ? (
              <CircularProgress size={14} sx={{ color: "white" }} />
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Panel izquierdo: lista de slides ── */}
        <div
          style={{
            width: 160,
            flexShrink: 0,
            borderRight: "1px solid #e2e8f0",
            background: "white",
            overflowY: "auto",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setSlideActivo(idx)}
              style={{
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  idx === slideActivo
                    ? "2px solid #f47c3c"
                    : "2px solid #e2e8f0",
                transition: "border-color 0.15s",
              }}
            >
              {/* Miniatura en tiempo real */}
              <SlidePreview slide={s} config={config} width={140} height={88} />

              {/* Controles */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "3px 5px",
                  background: idx === slideActivo ? "#fff5ef" : "#f8fafc",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: idx === slideActivo ? "#f47c3c" : "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  {idx + 1}
                </Typography>
                <div style={{ display: "flex" }}>
                  <Tooltip title="Vista previa">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalPreview(idx);
                      }}
                      sx={{ color: "#8daecb", p: 0.3 }}
                    >
                      <VisibilityIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Subir">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          moverSlide(idx, -1);
                        }}
                        sx={{
                          color: "#8daecb",
                          p: 0.3,
                          "&:disabled": { color: "#e2e8f0" },
                        }}
                      >
                        <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Bajar">
                    <span>
                      <IconButton
                        size="small"
                        disabled={idx === slides.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          moverSlide(idx, 1);
                        }}
                        sx={{
                          color: "#8daecb",
                          p: 0.3,
                          "&:disabled": { color: "#e2e8f0" },
                        }}
                      >
                        <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        size="small"
                        disabled={slides.length === 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          eliminarSlide(idx);
                        }}
                        sx={{
                          color: "#8daecb",
                          p: 0.3,
                          "&:disabled": { color: "#e2e8f0" },
                          "&:hover": { color: "#ef4444" },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}

          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={agregarSlide}
            sx={{
              color: "#f47c3c",
              borderColor: "#f47c3c",
              borderRadius: 2,
              mt: 1,
              border: "1.5px dashed",
              "&:hover": { bgcolor: "#fff5ef" },
            }}
          >
            Slide
          </Button>
        </div>

        {/* ── Panel derecho: editor ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Contenido principal */}
          {slide.layout !== "codigo" && (
            <div>
              {/* <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
                {slide.layout === "dos_columnas" ? "COLUMNA IZQUIERDA" : "CONTENIDO"}
              </Typography> */}
              <div style={{ marginTop: 4 }}>
                <MathTextEditor
                  key={`contenido-${slide.id}`}
                  initialData={slide.contenido}
                  onChange={(html) => actualizarSlide("contenido", html)}
                  siglaCurso={siglaCurso}
                  tema={config.tema}
                />
              </div>
            </div>
          )}

          {/* Columna derecha */}
          {slide.layout === "dos_columnas" && (
            <div>
              <Typography
                variant="caption"
                sx={{
                  color: "#6793ba",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                }}
              >
                COLUMNA DERECHA
              </Typography>
              <div style={{ marginTop: 4 }}>
                <MathTextEditor
                  key={`contenido_derecho-${slide.id}`}
                  initialData={slide.contenido_derecho ?? ""}
                  onChange={(html) =>
                    actualizarSlide("contenido_derecho", html)
                  }
                  siglaCurso={siglaCurso}
                  tema={config.tema}
                />
              </div>
            </div>
          )}

          {/* Código */}
          {slide.layout === "codigo" && (
            <div>
              <Typography
                variant="caption"
                sx={{
                  color: "#6793ba",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                }}
              >
                CÓDIGO
              </Typography>
              <textarea
                value={slide.contenido}
                onChange={(e) => actualizarSlide("contenido", e.target.value)}
                placeholder="// Escribe tu código aquí..."
                style={{
                  width: "100%",
                  minHeight: 200,
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 12,
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: "#1e293b",
                  background: "#f8fafc",
                  resize: "vertical",
                  outline: "none",
                  marginTop: 4,
                }}
              />
            </div>
          )}

          {/* Fondo */}
          {/* <div>
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
              FONDO (color opcional)
            </Typography>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <input type="color"
                value={slide.fondo || "#ffffff"}
                onChange={(e) => actualizarSlide("fondo", e.target.value === "#ffffff" ? "" : e.target.value)}
                style={{ width: 32, height: 32, border: "none", borderRadius: 6, cursor: "pointer", padding: 0 }}
              />
              {slide.fondo && (
                <button onClick={() => actualizarSlide("fondo", "")}
                  style={{ fontSize: 11, color: "#94a3b8", background: "none", border: "none", cursor: "pointer" }}>
                  limpiar
                </button>
              )}
            </div>
          </div> */}

          {/* Notas */}
          {/* <div>
            <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em" }}>
              NOTAS DEL PRESENTADOR
            </Typography>
            <textarea
              value={slide.notas ?? ""}
              onChange={(e) => actualizarSlide("notas", e.target.value)}
              placeholder="Notas visibles solo en modo presentador..."
              style={{ width: "100%", minHeight: 70, border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#64748b", background: "#f8fafc", resize: "vertical", outline: "none", marginTop: 4, fontFamily: "inherit" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#f47c3c")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            />
          </div> */}
        </div>
      </div>

      {/* ── Modal: configuración ── */}
      <Dialog
        open={modalConfig}
        onClose={() => setModalConfig(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Configuración
          <IconButton size="small" onClick={() => setModalConfig(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
        >
          <FormControl size="small" fullWidth>
            <InputLabel>Tema</InputLabel>
            <Select
              value={config.tema}
              label="Tema"
              onChange={(e) =>
                setConfig((c) => ({ ...c, tema: e.target.value }))
              }
            >
              {TEMAS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Transición</InputLabel>
            <Select
              value={config.transicion}
              label="Transición"
              onChange={(e) =>
                setConfig((c) => ({ ...c, transicion: e.target.value }))
              }
            >
              {TRANSICIONES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="menu-check"
              checked={config.menu}
              onChange={(e) =>
                setConfig((c) => ({ ...c, menu: e.target.checked }))
              }
            />
            <label
              htmlFor="menu-check"
              style={{ fontSize: 14, color: "#1e293b" }}
            >
              Mostrar menú de navegación
            </label>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setModalConfig(false)}
            sx={{ color: "#64748b" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: vista previa completa ── */}
      <Dialog
        open={modalPreview !== null}
        onClose={() => setModalPreview(null)}
        fullScreen
      >
        <DialogContent>
          <IconButton
            size="small"
            onClick={() => setModalPreview(null)}
            style={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          {modalPreview !== null && (
            <SlidePreview
              slide={slides[modalPreview]}
              config={config}
              width={1280}
              height={800}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* ── Modal: confirmar eliminar ── */}
      <Dialog open={modalEliminar} onClose={() => setModalEliminar(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: "#fef2f2", color: "#991b1b", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <DeleteOutlineIcon />
          <span>Eliminar diapositiva</span>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography variant="body2" sx={{ color: "#374151" }}>
            Se eliminará la diapositiva, sus slides y el contenido en Canvas. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setModalEliminar(false)} variant="outlined"
            sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={handleEliminar} variant="contained" disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" } }}>
            {eliminando ? "Eliminando..." : "Sí, eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default EditorDiapositiva;