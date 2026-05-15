// src/pages/capitulo/components/CapituloCard.tsx
import { useState }  from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, Typography, IconButton,
  Tooltip, Chip, TextField, CircularProgress,
  Button, Menu, MenuItem, ListItemIcon, Divider,
} from "@mui/material";
import ArrowForwardIcon          from "@mui/icons-material/ArrowForward";
import EditOutlinedIcon          from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon         from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon                 from "@mui/icons-material/Check";
import CloseIcon                 from "@mui/icons-material/Close";
import SchoolIcon                from "@mui/icons-material/School";
import PublicIcon                from "@mui/icons-material/Public";
import PublicOffIcon             from "@mui/icons-material/PublicOff";
import MoreHorizIcon             from "@mui/icons-material/MoreHoriz";
import DragIndicatorIcon         from "@mui/icons-material/DragIndicator";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  editarCapitulo,
  desplegarPendienteCapitulo,
} from "../../../store/slices/capitulo";
import type { ICapitulo } from "../../../store/slices/capitulo";
import DeploymentBadge           from "./DeploymentBadge";
import { ModalEliminarCapitulo } from "./ModalEliminarCapitulo";

interface Props {
  capitulo:         ICapitulo;
  curso_id:         string;
  isDragging?:      boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// Estilos compartidos para icon-buttons con borde
const iconBtnSx = {
  width: 30,
  height: 30,
  borderRadius: "7px",
  border: "0.5px solid #E2E8F0",
  bgcolor: "#F8FAFC",
  color: "#94A3B8",
  "&:hover": { bgcolor: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" },
};

const iconBtnActiveSx = {
  ...iconBtnSx,
  color: "#2563EB",
  bgcolor: "#EFF6FF",
  borderColor: "#BFDBFE",
  "&:hover": { bgcolor: "#DBEAFE", color: "#1D4ED8", borderColor: "#93C5FD" },
};

const CapituloCard = ({ capitulo, curso_id, isDragging = false, dragHandleProps = {} }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { clases } = useAppSelector((s) => s.claseMongo);
  const { temas }  = useAppSelector((s) => s.temaMongo);

  const nClases = clases.filter((c) => c.capitulo_id === capitulo._id).length;
  const nTemas  = temas.filter((t)  => t.capitulo_id  === capitulo._id).length;

  // ── Estado local ──────────────────────────────────────────────────────────
  const [verDeploys,    setVerDeploys]    = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [menuAnchor,    setMenuAnchor]    = useState<null | HTMLElement>(null);

  const [editando,  setEditando]  = useState(false);
  const [nombre,    setNombre]    = useState(capitulo.nombre);
  const [guardando, setGuardando] = useState(false);

  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi,    setTogglingApi]    = useState(false);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const tieneErrores = capitulo.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing",
  );
  const tienePending = capitulo.canvas_deployments.some(
    (d) => d.status === "pending",
  );
  const syncCount  = capitulo.canvas_deployments.filter((d) => d.status === "synced").length;
  const totalCount = capitulo.canvas_deployments.length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAbrirEdicion = () => {
    setMenuAnchor(null);
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

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(editarCapitulo({
      capitulo_id:      capitulo._id,
      published_canvas: !capitulo.published_canvas,
    }));
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(editarCapitulo({
      capitulo_id:   capitulo._id,
      published_api: !capitulo.published_api,
    }));
    setTogglingApi(false);
  };

  const handleEliminar = () => {
    setMenuAnchor(null);
    setModalEliminar(true);
  };

  const handleDesplegarPendiente = (canvas_curso_id: number) =>
    dispatch(desplegarPendienteCapitulo({ capitulo_id: capitulo._id, canvas_curso_id }));

  // ── Borde de estado ───────────────────────────────────────────────────────
  const borderColor = tieneErrores
    ? "#FCA5A5"
    : tienePending
      ? "#FDE68A"
      : "#E2E8F0";

  // ── Número del timeline ───────────────────────────────────────────────────
  const hasContent = nClases > 0 || nTemas > 0;

  return (
    <>
      {/* Dot del timeline — posicionado relativo al wrapper del padre */}
      <div className="relative">
        <div
          className={`absolute -left-[29px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full flex items-center justify-center text-[13px] font-medium ${
            hasContent
              ? "bg-[#2563EB] text-white"
              : "bg-white border-[1.5px] border-[#CBD5E1] text-[#94A3B8]"
          }`}
          style={{ zIndex: 1 }}
        >
          {capitulo.position}
        </div>

        <Card
          elevation={0}
          sx={{
            marginLeft: "16px",
            borderRadius: "12px",
            border: `0.5px solid ${borderColor}`,
            bgcolor: "white",
            opacity: isDragging ? 0.5 : 1,
            transition: "box-shadow 0.15s",
            "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
          }}
        >
          <CardContent sx={{ p: 0 }}>

            {/* ── Fila principal ── */}
            <div className="flex items-center gap-2.5 px-4 py-3">

              {/* Drag handle */}
              <div
                {...dragHandleProps}
                className="flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing text-[#CBD5E1] hover:text-[#94A3B8] transition-colors touch-none"
                aria-label="Arrastrar para reordenar"
              >
                <DragIndicatorIcon sx={{ fontSize: 20 }} />
              </div>

              {/* Nombre / editor inline */}
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
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.875rem" } }}
                    />
                    <Tooltip title="Guardar (Enter)">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleGuardarNombre}
                          disabled={guardando}
                          sx={{ color: "#2563EB" }}
                        >
                          {guardando
                            ? <CircularProgress size={14} />
                            : <CheckIcon fontSize="small" />
                          }
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Cancelar (Esc)">
                      <IconButton size="small" onClick={handleCancelarEdicion} sx={{ color: "#94A3B8" }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                ) : (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#1E293B", fontWeight: 500, fontSize: "14px", lineHeight: 1.3 }}
                      noWrap
                    >
                      {capitulo.nombre}
                    </Typography>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "11px" }}>
                        {nClases} clase{nClases !== 1 ? "s" : ""} · {nTemas} tema{nTemas !== 1 ? "s" : ""}
                      </Typography>
                      {totalCount > 0 && (
                        <Chip
                          label={`Canvas ${syncCount}/${totalCount}`}
                          size="small"
                          onClick={() => setVerDeploys((v) => !v)}
                          sx={{
                            height: 17,
                            fontSize: "0.6rem",
                            cursor: "pointer",
                            bgcolor: tieneErrores ? "#FEE2E2" : tienePending ? "#FEF9C3" : "#DCFCE7",
                            color:   tieneErrores ? "#991B1B" : tienePending ? "#854D0E" : "#065F46",
                          }}
                        />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Acciones — solo visibles fuera del modo edición */}
              {!editando && (
                <div className="flex items-center gap-1.5 shrink-0">

                  {/* Toggle Canvas */}
                  <Tooltip title={`Canvas: ${capitulo.published_canvas ? "publicado" : "oculto"}`}>
                    <span className="flex items-center">
                      {togglingCanvas ? (
                        <CircularProgress size={14} sx={{ color: "#2563EB", mx: 0.75 }} />
                      ) : (
                        <IconButton
                          size="small"
                          onClick={handleToggleCanvas}
                          disabled={togglingApi}
                          sx={capitulo.published_canvas ? iconBtnActiveSx : iconBtnSx}
                        >
                          <SchoolIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>

                  {/* Toggle API / plataforma */}
                  <Tooltip title={`Plataforma: ${capitulo.published_api ? "publicado" : "oculto"}`}>
                    <span className="flex items-center">
                      {togglingApi ? (
                        <CircularProgress size={14} sx={{ color: "#2563EB", mx: 0.75 }} />
                      ) : (
                        <IconButton
                          size="small"
                          onClick={handleToggleApi}
                          disabled={togglingCanvas}
                          sx={capitulo.published_api ? iconBtnActiveSx : iconBtnSx}
                        >
                          {capitulo.published_api
                            ? <PublicIcon sx={{ fontSize: 16 }} />
                            : <PublicOffIcon sx={{ fontSize: 16 }} />
                          }
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>

                  {/* Menú ⋯ — Editar + Eliminar */}
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    sx={iconBtnSx}
                  >
                    <MoreHorizIcon sx={{ fontSize: 17 }} />
                  </IconButton>

                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                      paper: {
                        sx: {
                          mt: 0.5,
                          minWidth: 150,
                          borderRadius: "8px",
                          border: "0.5px solid #E2E8F0",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={handleAbrirEdicion}
                      sx={{ gap: 1.5, py: 1.2, "&:hover": { bgcolor: "#F8FAFC" } }}
                    >
                      <ListItemIcon>
                        <EditOutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ color: "#334155" }}>Editar</Typography>
                    </MenuItem>

                    <Divider sx={{ borderColor: "#F1F5F9", my: 0.5 }} />

                    <MenuItem
                      onClick={handleEliminar}
                      sx={{ gap: 1.5, py: 1.2, "&:hover": { bgcolor: "#FFF5F5" } }}
                    >
                      <ListItemIcon>
                        <DeleteOutlineIcon sx={{ fontSize: 16, color: "#EF4444" }} />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ color: "#EF4444" }}>Eliminar</Typography>
                    </MenuItem>
                  </Menu>

                  {/* Navegar a clases */}
                  <Tooltip title="Ver clases">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/cursos/${curso_id}/capitulos/${capitulo._id}/clases`)
                      }
                      sx={{
                        ...iconBtnSx,
                        color: "#2563EB",
                        borderColor: "#BFDBFE",
                        bgcolor: "#EFF6FF",
                        "&:hover": { bgcolor: "#DBEAFE", color: "#1D4ED8", borderColor: "#93C5FD" },
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </div>

            {/* ── Deployments expandidos ── */}
            {verDeploys && (
              <div style={{ borderTop: "0.5px solid #F1F5F9" }}>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-3">
                    <SchoolIcon sx={{ fontSize: 13, color: "#2563EB" }} />
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 700,
                        fontSize: "10px",
                      }}
                    >
                      Estado en Canvas
                    </Typography>
                  </div>
                  <div className="flex flex-col gap-2">
                    {capitulo.canvas_deployments.length === 0 ? (
                      <Typography variant="caption" sx={{ color: "#94A3B8", fontStyle: "italic" }}>
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
                                fontSize: "0.65rem",
                                height: 22,
                                borderRadius: "6px",
                                textTransform: "none",
                                borderColor: "#FDE68A",
                                color: "#854D0E",
                                "&:hover": { bgcolor: "#FEF9C3", borderColor: "#F59E0B" },
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
      </div>

      {modalEliminar && (
        <ModalEliminarCapitulo capitulo={capitulo} onClose={() => setModalEliminar(false)} />
      )}
    </>
  );
};

export default CapituloCard;