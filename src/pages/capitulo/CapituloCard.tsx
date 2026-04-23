// src/pages/capitulos/CapituloCard.tsx
import { useState } from "react";
import {
  Card, CardContent, Typography, IconButton,
  Tooltip, Chip, Switch, TextField,
  Button, CircularProgress,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon      from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import SchoolIcon            from "@mui/icons-material/School";
import CheckIcon             from "@mui/icons-material/Check";
import CloseIcon             from "@mui/icons-material/Close";
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarCapitulo,
  eliminarCapitulo,
  // reintentarCapitulo,
  desplegarPendienteCapitulo,
  cambiarPositionCapitulo,
} from "../../store/slices/capitulo";
import type { ICapitulo }    from "../../store/slices/capitulo";
import DeploymentBadge       from "./DeploymentBadge";

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

  const [verDeploys, setVerDeploys] = useState(false);
  const [editando, setEditando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [form, setForm]             = useState({
    nombre:    capitulo.nombre,
    published: capitulo.published,
  });

  const tieneErrores = capitulo.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing"
  );
  const tienePending = capitulo.canvas_deployments.some(
    (d) => d.status === "pending"
  );
  const syncCount = capitulo.canvas_deployments.filter(
    (d) => d.status === "synced"
  ).length;
  const totalCount = capitulo.canvas_deployments.length;

  const handleMoverArriba = async () => {
    await dispatch(cambiarPositionCapitulo({
      capitulo_id: capitulo._id,
      direction:   'up',
    }));
  };

  const handleMoverAbajo = async () => {
    await dispatch(cambiarPositionCapitulo({
      capitulo_id: capitulo._id,
      direction:   'down',
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarCapitulo({
      capitulo_id: capitulo._id,
      nombre:      form.nombre,
      published:   form.published,
    }));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${capitulo.nombre}"? También se eliminará de Canvas.`))
      return;
    setEliminando(true);
    await dispatch(eliminarCapitulo({ capitulo_id: capitulo._id }));
    setEliminando(false);
  };

  const handleDesplegarPendiente = async (canvas_curso_id: number) => {
    await dispatch(desplegarPendienteCapitulo({
      capitulo_id: capitulo._id,
      canvas_curso_id,
    }));
  };

  return (
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
        "&:hover": {
          boxShadow: "0 4px 16px rgba(74,109,140,0.10)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ p: 0 }}>

        {/* ── Fila principal ── */}
        <div className="flex items-center gap-4 px-5 py-4">

          {/* Número circular */}
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 42, height: 42,
              borderRadius: "50%",
              background: "#4A6D8C",
              color: "white",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            {capitulo.position}
          </div>

          {/* Info o formulario edición */}
          <div className="flex-1 min-w-0">
            {editando ? (
              <div className="flex flex-col gap-2">
                <TextField
                  value={form.nombre}
                  onChange={(e) =>
                    setForm(f => ({ ...f, nombre: e.target.value }))
                  }
                  size="small"
                  autoFocus
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={form.published}
                    onChange={(e) =>
                      setForm(f => ({ ...f, published: e.target.checked }))
                    }
                    sx={{
                      "& .MuiSwitch-thumb": {
                        bgcolor: form.published ? "#4A6D8C" : "#ccc",
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#6793ba" }}>
                    {form.published ? "Publicado" : "No publicado"}
                  </Typography>
                </div>
              </div>
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#1f2c38", fontWeight: 500, lineHeight: 1.3 }}
                  noWrap
                >
                  {capitulo.nombre}
                </Typography>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Typography variant="caption" sx={{ color: "#6793ba" }}>
                    {nClases} clase{nClases !== 1 ? "s" : ""} · {nTemas} tema{nTemas !== 1 ? "s" : ""}
                  </Typography>
                  {totalCount > 0 && (
                    <Chip
                      label={
                        tieneErrores
                          ? "Error en Canvas"
                          : tienePending
                            ? "Pendiente de deploy"
                            : `${syncCount}/${totalCount} sync`
                      }
                      size="small"
                      onClick={() => setVerDeploys(v => !v)}
                      sx={{
                        fontSize: "0.62rem",
                        height: 18,
                        cursor: "pointer",
                        fontWeight: 600,
                        bgcolor: tieneErrores
                          ? "#fee2e2"
                          : tienePending
                            ? "#fef9c3"
                            : "#d1fae5",
                        color: tieneErrores
                          ? "#991b1b"
                          : tienePending
                            ? "#854d0e"
                            : "#065f46",
                        "&:hover": { opacity: 0.85 },
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Controles admin */}
          <div className="flex items-center gap-0.5 shrink-0">
            {editando ? (
              <>
                <Tooltip title="Guardar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleGuardar}
                      disabled={guardando}
                      sx={{ color: "#4A6D8C", "&:hover": { bgcolor: "#f0f4f8" } }}
                    >
                      {guardando
                        ? <CircularProgress size={14} />
                        : <CheckIcon fontSize="small" />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditando(false);
                      setForm({
                        nombre:    capitulo.nombre,
                        published: capitulo.published,
                      });
                    }}
                    sx={{ color: "#8daecb", "&:hover": { bgcolor: "#f0f4f8" } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={capitulo.published ? "Publicado" : "No publicado"}>
                  <Switch
                    size="small"
                    checked={capitulo.published}
                    disabled
                    sx={{
                      "& .MuiSwitch-thumb": {
                        bgcolor: capitulo.published ? "#4A6D8C" : "#ccc",
                      },
                    }}
                  />
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(true)}
                    sx={{
                      color: "#8daecb",
                      "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                    }}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleEliminar}
                      disabled={eliminando}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                      }}
                    >
                      {eliminando
                        ? <CircularProgress size={14} />
                        : <DeleteOutlineIcon fontSize="small" />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Subir posición">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esPrimero}
                      onClick={handleMoverArriba}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Bajar posición">
                  <span>
                    <IconButton
                      size="small"
                      disabled={esUltimo}
                      onClick={handleMoverAbajo}
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                        "&:disabled": { color: "#d9e4ee" },
                      }}
                    >
                      <KeyboardArrowDownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Gestionar clases">
                  <IconButton
                    size="small"
                    onClick={() =>
                      navigate(
                        `/cursos/${curso_id}/capitulos/${capitulo._id}/clases`
                      )
                    }
                    sx={{
                      color: "#4A6D8C",
                      "&:hover": { color: "#2e4154", bgcolor: "#f0f4f8" },
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* ── Deployments expandidos ── */}
        {verDeploys && (
          <div
            className="animate-slideDown"
            style={{ borderTop: "0.5px solid #d9e4ee" }}
          >
            <div className="px-5 py-3">
              <div className="flex items-center gap-1.5 mb-3">
                <SchoolIcon sx={{ fontSize: 13, color: "#8daecb" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6793ba",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Estado en Canvas
                </Typography>
              </div>

              <div className="flex flex-col gap-2">
                {capitulo.canvas_deployments.length === 0 ? (
                  <Typography
                    variant="caption"
                    sx={{ color: "#8daecb", fontStyle: "italic" }}
                  >
                    Sin cursos Canvas asociados
                  </Typography>
                ) : (
                  capitulo.canvas_deployments.map((d) => (
                    <div
                      key={d.canvas_curso_id}
                      className="flex items-center gap-2"
                    >
                      <DeploymentBadge
                        deployment={d}
                        capitulo_id={capitulo._id}
                      />
                      {d.status === "pending" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleDesplegarPendiente(d.canvas_curso_id)
                          }
                          sx={{
                            fontSize: "0.65rem",
                            height: 22,
                            borderRadius: 1.5,
                            borderColor: "#fde68a",
                            color: "#854d0e",
                            "&:hover": {
                              bgcolor: "#fef9c3",
                              borderColor: "#f59e0b",
                            },
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
  );
};

export default CapituloCard;