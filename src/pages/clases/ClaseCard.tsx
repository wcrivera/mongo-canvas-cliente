// src/pages/clases/ClaseCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography, IconButton,
  Tooltip, Switch, TextField, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon               from "@mui/icons-material/Add";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import WarningAmberIcon      from "@mui/icons-material/WarningAmber";
import SchoolIcon            from "@mui/icons-material/School";
import PublicIcon            from "@mui/icons-material/Public";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarClase,
  eliminarClase,
  cambiarPositionClase,
  reintentarClase,
} from "../../store/slices/clase";
import { crearTema } from "../../store/slices/tema";
import type { IClase, ICanvasDeploymentClase } from "../../store/slices/clase";
import TemaRow       from "./TemaRow";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  clase:     IClase;
  esPrimero: boolean;
  esUltimo:  boolean;
}

// ─── Badge de deployment individual ──────────────────────────────────────────

const ClaseDeploymentBadge = ({
  deployment,
  clase_id,
}: {
  deployment: ICanvasDeploymentClase;
  clase_id:   string;
}) => {
  const dispatch = useAppDispatch();
  const [reintentando, setReintentando] = useState(false);

  const handleReintentar = async () => {
    setReintentando(true);
    await dispatch(reintentarClase({
      clase_id,
      canvas_curso_id: deployment.canvas_curso_id,
    }));
    setReintentando(false);
  };

  const colorMap: Record<string, { bg: string; text: string; label: string }> = {
    synced:  { bg: "#d1fae5", text: "#065f46", label: "Sincronizado" },
    pending: { bg: "#fef9c3", text: "#854d0e", label: "Pendiente" },
    dirty:   { bg: "#fef9c3", text: "#854d0e", label: "Desactualizado" },
    error:   { bg: "#fee2e2", text: "#991b1b", label: "Error" },
    missing: { bg: "#fee2e2", text: "#991b1b", label: "Faltante" },
  };

  const cfg = colorMap[deployment.status] ?? { bg: "#f3f4f6", text: "#6b7280", label: deployment.status };

  return (
    <div className="flex items-center gap-2 flex-1">
      <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "0.7rem", minWidth: 60 }}>
        Canvas {deployment.canvas_curso_id}
      </Typography>
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: cfg.bg, color: cfg.text }}
      >
        {cfg.label}
      </span>
      {(deployment.status === "error" || deployment.status === "missing") && (
        <Button
          size="small"
          variant="outlined"
          disabled={reintentando}
          onClick={handleReintentar}
          sx={{
            fontSize: "0.6rem", height: 20, borderRadius: 1.5,
            borderColor: "#fca5a5", color: "#991b1b", px: 1,
            "&:hover": { bgcolor: "#fee2e2", borderColor: "#ef4444" },
          }}
        >
          {reintentando ? <CircularProgress size={10} /> : "Reintentar"}
        </Button>
      )}
      {deployment.error_msg && (
        <Typography variant="caption" sx={{ color: "#ef4444", fontSize: "0.65rem" }} noWrap>
          {deployment.error_msg}
        </Typography>
      )}
    </div>
  );
};

// ─── Modal eliminar ───────────────────────────────────────────────────────────

const ModalEliminar = ({
  clase,
  onClose,
}: {
  clase:   IClase;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const [eliminando, setEliminando] = useState(false);

  const handleEliminar = async () => {
    setEliminando(true);
    await dispatch(eliminarClase({ clase_id: clase._id }));
    setEliminando(false);
    onClose();
  };

  const tieneSynced = clase.canvas_deployments.some((d) => d.status === "synced");

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: 3 } }}>
      <DialogTitle sx={{
        bgcolor: "#fef2f2", color: "#991b1b",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <WarningAmberIcon />
        <span>Eliminar clase</span>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
          ¿Eliminar la clase <strong>{clase.nombre}</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: tieneSynced ? 2 : 0 }}>
          Se eliminarán todos los temas y recursos asociados.
          Esta acción no se puede deshacer.
        </Typography>
        {tieneSynced && (
          <Typography variant="caption" sx={{
            color: "#854d0e", bgcolor: "#fef9c3",
            borderRadius: 1.5, px: 1.5, py: 0.75, display: "block",
          }}>
            ⚠️ El item también se eliminará de Canvas.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined"
          sx={{ borderColor: "#d1d5db", color: "#374151", borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleEliminar}
          variant="contained"
          disabled={eliminando}
          startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{
            bgcolor: "#dc2626", borderRadius: 2, px: 3, fontWeight: 600,
            boxShadow: "none", "&:hover": { bgcolor: "#b91c1c", boxShadow: "none" },
          }}
        >
          {eliminando ? "Eliminando..." : "Sí, eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Card principal ───────────────────────────────────────────────────────────

const ClaseCard = ({ clase, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const { temas } = useAppSelector((s) => s.temaMongo);

  const temasClase = temas
    .filter((t) => t.clase_id === clase._id)
    .sort((a, b) => a.position - b.position);

  // ── Estado local ───────────────────────────────────────────────────────────
  const [modalEliminar,   setModalEliminar]   = useState(false);
  const [editando,        setEditando]        = useState(false);
  const [nombre,          setNombre]          = useState(clase.nombre);
  const [guardando,       setGuardando]       = useState(false);
  const [togglingCanvas,  setTogglingCanvas]  = useState(false);
  const [togglingApi,     setTogglingApi]     = useState(false);
  const [moviendo,        setMoviendo]        = useState(false);
  const [verDeploys,      setVerDeploys]      = useState(false);
  const [mostrarFormTema, setMostrarFormTema] = useState(false);
  const [nombreTema,      setNombreTema]      = useState("");
  const [creandoTema,     setCreandoTema]     = useState(false);

  // ── Derivados Canvas ───────────────────────────────────────────────────────
  const totalCount   = clase.canvas_deployments.length;
  const syncCount    = clase.canvas_deployments.filter((d) => d.status === "synced").length;
  const tieneErrores = clase.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing",
  );
  const tienePending = clase.canvas_deployments.some(
    (d) => d.status === "pending" || d.status === "dirty",
  );

  // ── Handlers nombre ────────────────────────────────────────────────────────

  const handleAbrirEdicion = () => {
    setNombre(clase.nombre);
    setEditando(true);
  };

  const handleCancelarEdicion = () => {
    setNombre(clase.nombre);
    setEditando(false);
  };

  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === clase.nombre) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    await dispatch(editarClase({ clase_id: clase._id, nombre: nombreTrim }));
    setGuardando(false);
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleGuardarNombre();
    if (e.key === "Escape") handleCancelarEdicion();
  };

  // ── Handlers published ─────────────────────────────────────────────────────

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(editarClase({ clase_id: clase._id, published_canvas: !clase.published_canvas }));
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(editarClase({ clase_id: clase._id, published_api: !clase.published_api }));
    setTogglingApi(false);
  };

  // ── Handlers posición ──────────────────────────────────────────────────────

  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionClase({ clase_id: clase._id, direction }));
    setMoviendo(false);
  };

  // ── Handlers tema ──────────────────────────────────────────────────────────

  const handleCrearTema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTema.trim()) return;
    setCreandoTema(true);
    await dispatch(crearTema({ clase_id: clase._id, nombre: nombreTema.trim() }));
    setCreandoTema(false);
    setNombreTema("");
    setMostrarFormTema(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        elevation={0}
        className="animate-fadeIn"
        sx={{
          borderRadius: 3,
          border: tieneErrores
            ? "1px solid #fca5a5"
            : tienePending
              ? "1px solid #fde68a"
              : "1px solid #d9e4ee",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
        }}
      >
        <CardContent sx={{ p: 0 }}>

          {/* ── Fila principal ── */}
          <div className="flex items-center gap-3 px-4 py-3">

            {/* Número circular */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "#6793ba", color: "white", fontSize: 13, fontWeight: 600,
              }}
            >
              {clase.position}
            </div>

            {/* Nombre e info ── */}
            <div className="flex-1 min-w-0">
              {editando ? (
                <div className="flex items-center gap-1">
                  <TextField
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={handleKeyDown}
                    size="small"
                    autoFocus
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.875rem" } }}
                  />
                  <Tooltip title="Guardar (Enter)">
                    <span>
                      <IconButton size="small" onClick={handleGuardarNombre} disabled={guardando}
                        sx={{ color: "#4A6D8C" }}>
                        {guardando
                          ? <CircularProgress size={14} />
                          : <CheckIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Cancelar (Esc)">
                    <IconButton size="small" onClick={handleCancelarEdicion}
                      sx={{ color: "#8daecb" }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#1f2c38", fontWeight: 600, lineHeight: 1.3 }}
                    noWrap
                  >
                    <LatexRenderer>{clase.nombre}</LatexRenderer>
                  </Typography>
                  {/* Chip Canvas — solo si hay deployments */}
                  {totalCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Chip
                        label={`Canvas ${syncCount}/${totalCount}`}
                        size="small"
                        onClick={() => setVerDeploys((v) => !v)}
                        sx={{
                          height: 17, fontSize: "0.6rem", cursor: "pointer",
                          bgcolor: tieneErrores ? "#fee2e2" : tienePending ? "#fef9c3" : "#d1fae5",
                          color:   tieneErrores ? "#991b1b" : tienePending ? "#854d0e" : "#065f46",
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controles — ocultos durante edición ── */}
            {!editando && (
              <div className="flex items-center gap-0.5 shrink-0">

                {/* Toggle Canvas */}
                <Tooltip title={`Canvas: ${clase.published_canvas ? "publicada" : "oculta"}`}>
                  <span className="flex items-center gap-0.5">
                    <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                    {togglingCanvas
                      ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                      : (
                        <Switch
                          size="small"
                          checked={clase.published_canvas}
                          onChange={handleToggleCanvas}
                          disabled={moviendo || togglingApi}
                          sx={{
                            "& .MuiSwitch-thumb": { bgcolor: clase.published_canvas ? "#4A6D8C" : "#ccc" },
                            "& .MuiSwitch-track": { bgcolor: clase.published_canvas ? "#6793ba !important" : "#d9e4ee !important" },
                          }}
                        />
                      )
                    }
                  </span>
                </Tooltip>

                {/* Toggle API */}
                <Tooltip title={`Plataforma: ${clase.published_api ? "publicada" : "oculta"}`}>
                  <span className="flex items-center gap-0.5">
                    <PublicIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                    {togglingApi
                      ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                      : (
                        <Switch
                          size="small"
                          checked={clase.published_api}
                          onChange={handleToggleApi}
                          disabled={moviendo || togglingCanvas}
                          sx={{
                            "& .MuiSwitch-thumb": { bgcolor: clase.published_api ? "#4A6D8C" : "#ccc" },
                            "& .MuiSwitch-track": { bgcolor: clase.published_api ? "#6793ba !important" : "#d9e4ee !important" },
                          }}
                        />
                      )
                    }
                  </span>
                </Tooltip>

                {/* Flecha arriba */}
                <Tooltip title="Mover arriba">
                  <span>
                    <IconButton size="small" disabled={esPrimero || moviendo}
                      onClick={() => handleMover("up")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}>
                      {moviendo
                        ? <CircularProgress size={14} sx={{ color: "#8daecb" }} />
                        : <KeyboardArrowUpIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Flecha abajo */}
                <Tooltip title="Mover abajo">
                  <span>
                    <IconButton size="small" disabled={esUltimo || moviendo}
                      onClick={() => handleMover("down")}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" }, "&:disabled": { color: "#d9e4ee" } }}>
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Editar nombre */}
                <Tooltip title="Editar nombre">
                  <IconButton size="small" onClick={handleAbrirEdicion} disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Eliminar */}
                <Tooltip title="Eliminar clase">
                  <IconButton size="small" onClick={() => setModalEliminar(true)} disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

              </div>
            )}
          </div>

          {/* ── Deployments expandidos ── */}
          {verDeploys && totalCount > 0 && (
            <div className="animate-slideDown" style={{ borderTop: "0.5px solid #d9e4ee" }}>
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                  <Typography variant="caption" sx={{
                    color: "#6793ba", textTransform: "uppercase",
                    letterSpacing: "0.06em", fontWeight: 600,
                  }}>
                    Estado en Canvas
                  </Typography>
                </div>
                <div className="flex flex-col gap-1.5">
                  {clase.canvas_deployments.map((d) => (
                    <ClaseDeploymentBadge
                      key={d.canvas_curso_id}
                      deployment={d}
                      clase_id={clase._id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Temas ── */}
          {temasClase.length > 0 && (
            <div
              className="px-4 pb-2 flex flex-col gap-1"
              style={{ borderTop: "0.5px solid #f0f4f8" }}
            >
              {temasClase.map((tema, idx) => (
                <TemaRow
                  key={tema._id}
                  tema={tema}
                  esPrimero={idx === 0}
                  esUltimo={idx === temasClase.length - 1}
                />
              ))}
            </div>
          )}

          {/* ── Agregar tema ── */}
          <div className="px-4 pb-3">
            {mostrarFormTema ? (
              <form onSubmit={handleCrearTema} className="flex items-center gap-2 mt-2">
                <TextField
                  value={nombreTema}
                  onChange={(e) => setNombreTema(e.target.value)}
                  size="small"
                  autoFocus
                  fullWidth
                  placeholder="Nombre del tema"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "0.8rem" } }}
                />
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  disabled={creandoTema || !nombreTema.trim()}
                  sx={{
                    bgcolor: "#4A6D8C", borderRadius: 2, px: 2, fontWeight: 600,
                    boxShadow: "none", whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
                  }}
                >
                  {creandoTema ? <CircularProgress size={14} color="inherit" /> : "Agregar"}
                </Button>
                <IconButton
                  size="small"
                  onClick={() => { setMostrarFormTema(false); setNombreTema(""); }}
                  sx={{ color: "#8daecb" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </form>
            ) : (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setMostrarFormTema(true)}
                sx={{
                  color: "#8daecb", fontSize: "0.72rem", fontWeight: 500,
                  "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                }}
              >
                Agregar tema
              </Button>
            )}
          </div>

        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminar clase={clase} onClose={() => setModalEliminar(false)} />
      )}
    </>
  );
};

export default ClaseCard;