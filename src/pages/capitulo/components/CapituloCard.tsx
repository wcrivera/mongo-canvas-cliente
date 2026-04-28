// src/pages/capitulo/CapituloCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography, IconButton,
  Tooltip, Chip, Switch, TextField, CircularProgress,
  Button,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon      from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import SchoolIcon            from "@mui/icons-material/School";
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  editarCapitulo,
  reintentarCapitulo,
  desplegarPendienteCapitulo,
  cambiarPositionCapitulo,
} from "../../../store/slices/capitulo";
import type { ICapitulo } from "../../../store/slices/capitulo";
import DeploymentBadge    from "./DeploymentBadge";
import { ModalEliminarCapitulo } from "./ModalEliminarCapitulo";

interface Props {
  capitulo:  ICapitulo;
  curso_id:  string;
  esPrimero: boolean;
  esUltimo:  boolean;
}

const CapituloCard = ({ capitulo, curso_id, esPrimero, esUltimo }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { clases } = useAppSelector((s) => s.claseMongo);
  const { temas }  = useAppSelector((s) => s.temaMongo);

  const nClases = clases.filter((c) => c.capitulo_id === capitulo._id).length;
  const nTemas  = temas.filter((t) => t.capitulo_id === capitulo._id).length;

  // ── Estado local ───────────────────────────────────────────────────────────
  const [verDeploys,    setVerDeploys]    = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const [editando,  setEditando]  = useState(false);
  const [nombre,    setNombre]    = useState(capitulo.nombre);
  const [guardando, setGuardando] = useState(false);
  const [toggling,  setToggling]  = useState(false);

  // Bloquea ambas flechas mientras se procesa el cambio de posición
  const [moviendo,  setMoviendo]  = useState(false);

  // ── Derivados ──────────────────────────────────────────────────────────────
  const tieneErrores = capitulo.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing",
  );
  const tienePending = capitulo.canvas_deployments.some(
    (d) => d.status === "pending",
  );
  const syncCount  = capitulo.canvas_deployments.filter((d) => d.status === "synced").length;
  const totalCount = capitulo.canvas_deployments.length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAbrirEdicion = () => {
    setNombre(capitulo.nombre);
    setEditando(true);
  };

  const handleCancelarEdicion = () => {
    setNombre(capitulo.nombre);
    setEditando(false);
  };

  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === capitulo.nombre) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    await dispatch(editarCapitulo({ capitulo_id: capitulo._id, nombre: nombreTrim }));
    setGuardando(false);
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleGuardarNombre();
    if (e.key === "Escape") handleCancelarEdicion();
  };

  const handleTogglePublished = async () => {
    setToggling(true);
    await dispatch(editarCapitulo({
      capitulo_id: capitulo._id,
      published:   !capitulo.published,
    }));
    setToggling(false);
  };

  // Ambas flechas comparten el mismo guard — mientras una opera, ambas quedan
  // deshabilitadas, evitando requests simultáneos sobre el mismo capítulo.
  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(cambiarPositionCapitulo({ capitulo_id: capitulo._id, direction }));
    setMoviendo(false);
  };

  const handleDesplegarPendiente = (canvas_curso_id: number) =>
    dispatch(desplegarPendienteCapitulo({ capitulo_id: capitulo._id, canvas_curso_id }));

  void reintentarCapitulo; // usado por DeploymentBadge

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
          transition: "box-shadow 0.2s, transform 0.2s",
          "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.10)", transform: "translateY(-1px)" },
        }}
      >
        <CardContent sx={{ p: 0 }}>

          {/* ── Fila principal ── */}
          <div className="flex items-center gap-3 px-4 py-3">

            {/* Número circular */}
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "#4A6D8C", color: "white", fontSize: 14, fontWeight: 600,
              }}
            >
              {capitulo.position}
            </div>

            {/* Nombre — normal o en edición ── */}
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
                    {capitulo.nombre}
                  </Typography>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Typography variant="caption" sx={{ color: "#8daecb" }}>
                      {nClases} clase{nClases !== 1 ? "s" : ""} · {nTemas} tema{nTemas !== 1 ? "s" : ""}
                    </Typography>
                    {totalCount > 0 && (
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
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Controles — ocultos durante edición del nombre ── */}
            {!editando && (
              <div className="flex items-center gap-0.5 shrink-0">

                {/* Switch published */}
                <Tooltip title={capitulo.published ? "Publicado — click para ocultar" : "Oculto — click para publicar"}>
                  <span>
                    {toggling
                      ? <CircularProgress size={16} sx={{ color: "#4A6D8C", mx: 0.75 }} />
                      : (
                        <Switch
                          size="small"
                          checked={capitulo.published}
                          onChange={handleTogglePublished}
                          disabled={moviendo}
                          sx={{
                            "& .MuiSwitch-thumb": { bgcolor: capitulo.published ? "#4A6D8C" : "#ccc" },
                            "& .MuiSwitch-track": { bgcolor: capitulo.published ? "#6793ba !important" : "#d9e4ee !important" },
                          }}
                        />
                      )
                    }
                  </span>
                </Tooltip>

                {/* Flecha arriba */}
                <Tooltip title="Mover arriba">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esPrimero || moviendo}
                      onClick={() => handleMover("up")}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      {moviendo
                        ? <CircularProgress size={14} sx={{ color: "#8daecb" }} />
                        : <KeyboardArrowUpIcon fontSize="small" />
                      }
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Flecha abajo */}
                <Tooltip title="Mover abajo">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esUltimo || moviendo}
                      onClick={() => handleMover("down")}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      {/* Solo la flecha de abajo muestra el spinner para no duplicar */}
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Editar nombre */}
                <Tooltip title="Editar nombre">
                  <IconButton size="small" onClick={handleAbrirEdicion}
                    disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Eliminar */}
                <Tooltip title="Eliminar capítulo">
                  <IconButton size="small" onClick={() => setModalEliminar(true)}
                    disabled={moviendo}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Navegar a clases */}
                <Tooltip title="Ver clases">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/cursos/${curso_id}/capitulos/${capitulo._id}/clases`)}
                    sx={{ color: "#4A6D8C", "&:hover": { color: "#2e4154", bgcolor: "#f0f4f8" } }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

              </div>
            )}
          </div>

          {/* ── Deployments expandidos ── */}
          {verDeploys && (
            <div className="animate-slideDown" style={{ borderTop: "0.5px solid #d9e4ee" }}>
              <div className="px-5 py-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                  <Typography variant="caption" sx={{
                    color: "#6793ba", textTransform: "uppercase",
                    letterSpacing: "0.06em", fontWeight: 600,
                  }}>
                    Estado en Canvas
                  </Typography>
                </div>
                <div className="flex flex-col gap-2">
                  {capitulo.canvas_deployments.length === 0 ? (
                    <Typography variant="caption" sx={{ color: "#8daecb", fontStyle: "italic" }}>
                      Sin cursos Canvas asociados
                    </Typography>
                  ) : (
                    capitulo.canvas_deployments.map((d) => (
                      <div key={d.canvas_curso_id} className="flex items-center gap-2">
                        <DeploymentBadge deployment={d} capitulo_id={capitulo._id} />
                        {d.status === "pending" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDesplegarPendiente(d.canvas_curso_id)}
                            sx={{
                              fontSize: "0.65rem", height: 22, borderRadius: 1.5,
                              borderColor: "#fde68a", color: "#854d0e",
                              "&:hover": { bgcolor: "#fef9c3", borderColor: "#f59e0b" },
                            }}
                          >
                            Desplegar
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminarCapitulo capitulo={capitulo} onClose={() => setModalEliminar(false)} />
      )}
    </>
  );
};

export default CapituloCard;