// src/components/banco/ModalBanco.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, CircularProgress, Chip,
  IconButton, Tooltip, Pagination, Alert,
} from "@mui/material";
import CloseIcon      from "@mui/icons-material/Close";
import SearchIcon     from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SchoolIcon     from "@mui/icons-material/School";
import { fetchConToken } from "../../helpers/fetch";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Modo = "ejercicio" | "pregunta";

interface IItemBanco {
  _id: string;
  enunciado: string;
  tipo_pregunta?: string;   // ejercicio
  tipo?: string;            // pregunta
  nombre?: string;          // ejercicio
  puntos: number;
  curso_nombre: string;
  capitulo_nombre: string;
  quiz_titulo?: string;     // solo pregunta
}

interface ICursoBanco {
  _id: string;
  label: string;
}

interface Props {
  modo: Modo;
  // Destino para la copia
  capitulo_id?: string;   // requerido si modo === "ejercicio"
  curso_id?: string;      // requerido si modo === "ejercicio"
  quiz_id?: string;       // requerido si modo === "pregunta"
  // Callbacks
  onCopiado: () => void;
  onClose: () => void;
}

// ─── Etiquetas de tipo ────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  multiple_choice:  "Opción múltiple",
  multiple_answers: "Respuestas múltiples",
  true_false:       "V / F",
  short_answer:     "Respuesta corta",
  essay:            "Ensayo",
  matching:         "Coincidencia",
  numerical:        "Numérica",
  calculated:       "Calculada",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice:  "#4A6D8C",
  multiple_answers: "#6b46c1",
  true_false:       "#2e7d32",
  short_answer:     "#b45309",
  essay:            "#78350f",
  matching:         "#0369a1",
  numerical:        "#b91c1c",
  calculated:       "#be185d",
};

// Quita tags HTML para mostrar texto plano en la preview
const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// ─────────────────────────────────────────────────────────────────────────────

const ModalBanco = ({ modo, capitulo_id, curso_id, quiz_id, onCopiado, onClose }: Props) => {

  const [items, setItems]         = useState<IItemBanco[]>([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [copiando, setCopiando]   = useState<string | null>(null); // id del item copiándose
  const [error, setError]         = useState<string | null>(null);

  // Filtros
  const [q, setQ]               = useState("");
  const [qInput, setQInput]     = useState(""); // valor del input (debounced)
  const [tipo, setTipo]         = useState("");
  const [cursoFiltro, setCursoFiltro] = useState("");
  const [cursos, setCursos]     = useState<ICursoBanco[]>([]);

  const endpoint       = modo === "ejercicio" ? "api/admin/banco/ejercicios"       : "api/admin/banco/preguntas";
  const cursosEndpoint = modo === "ejercicio" ? "api/admin/banco/ejercicios/cursos" : "api/admin/banco/preguntas/cursos";
  const copiarEndpoint = modo === "ejercicio" ? "api/admin/banco/ejercicios/copiar" : "api/admin/banco/preguntas/copiar";

  // ── Cargar cursos disponibles para el filtro ──────────────────────────────
  useEffect(() => {
    fetchConToken(cursosEndpoint)
      .then((r) => r.json())
      .then((body) => { if (body.ok) setCursos(body.data); })
      .catch((err) => console.error("[banco] error cursos:", err));
  }, [cursosEndpoint]);

  // ── Buscar ────────────────────────────────────────────────────────────────
  const buscar = useCallback(async (pg = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q)           params.set("q", q);
      if (tipo)        params.set("tipo", tipo);
      if (cursoFiltro) params.set("curso_id", cursoFiltro);
      params.set("page",  String(pg));
      params.set("limit", "15");

      const resp = await fetchConToken(`${endpoint}?${params.toString()}`);
      const body = await resp.json();
      if (body.ok) {
        setItems(body.items);
        setTotal(body.total);
        setPages(body.pages);
        setPage(pg);
      } else {
        setError(body.msg ?? "Error al buscar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [q, tipo, cursoFiltro, endpoint]);

  // Buscar al montar y cuando cambien filtros (excepto q que es manual)
  useEffect(() => {
    buscar(1);
  }, [tipo, cursoFiltro]); // eslint-disable-line react-hooks/exhaustive-deps

  // Búsqueda inicial
  useEffect(() => {
    buscar(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    setQ(qInput);
    buscar(1);
  };

  // ── Copiar ────────────────────────────────────────────────────────────────
  const handleCopiar = async (item: IItemBanco) => {
    setCopiando(item._id);
    setError(null);
    try {
      const body =
        modo === "ejercicio"
          ? { origen_id: item._id, capitulo_id, curso_id }
          : { origen_id: item._id, quiz_id };

      const resp = await fetchConToken(
        copiarEndpoint,
        body as Record<string, unknown>,
        "POST",
      );
      const data = await resp.json();
      if (data.ok) {
        onCopiado();
        onClose();
      } else {
        setError(data.msg ?? "Error al copiar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setCopiando(null);
    }
  };

  const tipoKey = (item: IItemBanco) => item.tipo_pregunta ?? item.tipo ?? "";

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: "90vh" } } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          bgcolor: "#4A6D8C",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 3,
        }}
      >
        <div className="flex items-center gap-2">
          <SchoolIcon sx={{ fontSize: 22 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>Banco de preguntas</div>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {modo === "ejercicio" ? "Copiar ejercicio" : "Copiar pregunta de quiz"}
            </Typography>
          </div>
        </div>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Filtros ── */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex flex-col gap-3">
          {/* Búsqueda */}
          <form onSubmit={handleBuscar} className="flex gap-2">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por enunciado o nombre..."
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#4A6D8C", "&:hover": { bgcolor: "#3a5a7a" }, borderRadius: 2, minWidth: 44, px: 1.5 }}
            >
              <SearchIcon />
            </Button>
          </form>

          {/* Filtros tipo y curso */}
          <div className="flex gap-2 flex-wrap">
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel>Tipo de pregunta</InputLabel>
              <Select
                value={tipo}
                label="Tipo de pregunta"
                onChange={(e) => setTipo(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Todos</em></MenuItem>
                {Object.entries(TIPO_LABELS).map(([val, lbl]) => (
                  <MenuItem key={val} value={val}>{lbl}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 230 }}>
              <InputLabel>Curso</InputLabel>
              <Select
                value={cursoFiltro}
                label="Curso"
                onChange={(e) => setCursoFiltro(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Todos los cursos</em></MenuItem>
                {cursos.map((c) => (
                  <MenuItem key={c._id} value={c._id}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {(q || tipo || cursoFiltro) && (
              <Button
                size="small"
                onClick={() => {
                  setQ(""); setQInput(""); setTipo(""); setCursoFiltro("");
                  setTimeout(() => buscar(1), 0);
                }}
                sx={{ color: "#6793ba", fontSize: 12 }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <Typography variant="caption" sx={{ color: "#6793ba" }}>
            {loading ? "Buscando..." : `${total} resultado${total !== 1 ? "s" : ""}`}
          </Typography>
        </div>

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" sx={{ mx: 3, mt: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* ── Lista ── */}
        <div className="overflow-y-auto flex-1 px-3 py-3 flex flex-col gap-2">
          {loading && (
            <div className="flex justify-center py-10">
              <CircularProgress sx={{ color: "#4A6D8C" }} />
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <SchoolIcon sx={{ fontSize: 48, color: "#b3c9dd" }} />
              <Typography variant="body2" sx={{ color: "#6793ba" }}>
                No se encontraron preguntas con los filtros actuales
              </Typography>
            </div>
          )}

          {!loading && items.map((item) => {
            const tk = tipoKey(item);
            const color = TIPO_COLOR[tk] ?? "#4A6D8C";
            const isCopying = copiando === item._id;

            return (
              <div
                key={item._id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: "white",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Nombre (solo ejercicios) */}
                  {item.nombre && (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", mb: 0.3 }}>
                      {item.nombre}
                    </Typography>
                  )}

                  {/* Enunciado truncado */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#374151",
                      fontSize: 13,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 1,
                    }}
                  >
                    {stripHtml(item.enunciado) || <em style={{ color: "#9ca3af" }}>Sin enunciado</em>}
                  </Typography>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 items-center">
                    <Chip
                      label={TIPO_LABELS[tk] ?? tk}
                      size="small"
                      sx={{
                        bgcolor: `${color}18`,
                        color,
                        fontWeight: 600,
                        fontSize: 11,
                        height: 20,
                      }}
                    />
                    <Chip
                      label={`${item.puntos} pt${item.puntos !== 1 ? "s" : ""}`}
                      size="small"
                      sx={{ bgcolor: "#f1f5f9", color: "#475569", fontSize: 11, height: 20 }}
                    />
                    <Typography variant="caption" sx={{ color: "#94a3b8", ml: 0.5 }}>
                      {item.curso_nombre} · {item.capitulo_nombre}
                      {item.quiz_titulo ? ` · ${item.quiz_titulo}` : ""}
                    </Typography>
                  </div>
                </div>

                {/* Botón copiar */}
                <Tooltip title="Copiar al destino actual">
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isCopying ? <CircularProgress size={14} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                      disabled={!!copiando}
                      onClick={() => handleCopiar(item)}
                      sx={{
                        borderColor: "#4A6D8C",
                        color: "#4A6D8C",
                        borderRadius: 2,
                        fontSize: 12,
                        whiteSpace: "nowrap",
                        "&:hover": { borderColor: "#3a5a7a", bgcolor: "#f0f4f8" },
                      }}
                    >
                      {isCopying ? "Copiando..." : "Usar esta"}
                    </Button>
                  </span>
                </Tooltip>
              </div>
            );
          })}
        </div>

        {/* ── Paginación ── */}
        {pages > 1 && (
          <div className="flex justify-center py-3 border-t border-gray-100">
            <Pagination
              count={pages}
              page={page}
              onChange={(_, pg) => buscar(pg)}
              size="small"
              sx={{ "& .MuiPaginationItem-root": { color: "#4A6D8C" } }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalBanco;