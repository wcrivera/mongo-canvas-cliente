// src/pages/capitulo/components/CapituloCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  CardContent,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { editarCapitulo } from "../../../store/slices/capitulo";
import type { ICapitulo } from "../../../store/slices/capitulo";
import { ModalEliminarCapitulo } from "./ModalEliminarCapitulo";
import { iconBtnActiveSx, iconBtnSx } from "../../../styles/iconButtons";

interface Props {
  capitulo: ICapitulo;
  curso_id: string;
  index: number;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// ── Componente ────────────────────────────────────────────────────────────────
const CapituloCard = ({
  capitulo,
  curso_id,
  index,
  isDragging = false,
  dragHandleProps = {},
}: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { clases } = useAppSelector((s) => s.claseMongo);
  const { temas } = useAppSelector((s) => s.temaMongo);

  const nClases = clases.filter((c) => c.capitulo_id === capitulo._id).length;
  const nTemas = temas.filter((t) => t.capitulo_id === capitulo._id).length;

  // ── Estado local ──────────────────────────────────────────────────────────
  const [modalEliminar, setModalEliminar] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(capitulo.nombre);
  const [guardando, setGuardando] = useState(false);
  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);

  // ── Derivados Canvas ──────────────────────────────────────────────────────
  const tieneErrores = capitulo.canvas_deployments.some(
    (d) => d.status === "error" || d.status === "missing",
  );
  const tienePending = capitulo.canvas_deployments.some(
    (d) => d.status === "pending",
  );
  const syncCount = capitulo.canvas_deployments.filter(
    (d) => d.status === "synced",
  ).length;
  // const hasContent = nClases > 0 || nTemas > 0;

  const borderColor = tieneErrores
    ? "#FCA5A5"
    : tienePending
      ? "#FDE68A"
      : "#E2E8F0";

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
  const handleEliminar = () => {
    setMenuAnchor(null);
    setModalEliminar(true);
  };

  const handleGuardarNombre = async () => {
    const nombreTrim = nombre.trim();
    if (!nombreTrim || nombreTrim === capitulo.nombre) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    await dispatch(
      editarCapitulo({ capitulo_id: capitulo._id, nombre: nombreTrim }),
    );
    setGuardando(false);
    setEditando(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGuardarNombre();
    if (e.key === "Escape") handleCancelarEdicion();
  };

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(
      editarCapitulo({
        capitulo_id: capitulo._id,
        published_canvas: !capitulo.published_canvas,
      }),
    );
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarCapitulo({
        capitulo_id: capitulo._id,
        published_api: !capitulo.published_api,
      }),
    );
    setTogglingApi(false);
  };

  const handleNavegar = () =>
    navigate(`/cursos/${curso_id}/capitulos/${capitulo._id}/clases`);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        elevation={1}
        sx={{
          borderRadius: "12px",
          border: `0.5px solid ${borderColor}`,
          bgcolor: "white",
          opacity: isDragging ? 0.5 : 1,
          overflow: "hidden",
          transition: "box-shadow 0.15s",
          "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.07)" },
        }}
      >
        <CardContent
          sx={{
            p: 0,
            border: "0.5px solid transparent",
            "&:hover": { borderColor: "#E2E8F0" },
          }}
        >
          {/* ── Fila principal ── */}
          <div style={{ display: "flex" }}>
            <div
            // className="cursor-pointer"
              {...dragHandleProps}
              style={{
                padding: 12,
                display: "flex",
                alignItems: "center",
                color: "#CBD5E1",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label="Arrastrar para reordenar"
            >
              <DragIndicatorIcon sx={{ fontSize: 24 }} />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                // color: "white",
                // cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label="Arrastrar para reordenar"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white text-sm font-bold">
                {index + 1}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 14px",
                minWidth: 0,
              }}
            >
              {/* Nombre / editor inline */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editando ? (
                  <div className="flex items-center gap-1">
                    <TextField
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={handleKeyDown}
                      size="small"
                      autoFocus
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                        },
                      }}
                    />
                    <Tooltip title="Guardar (Enter)">
                      <span>
                        <IconButton
                          size="small"
                          onClick={handleGuardarNombre}
                          disabled={guardando}
                          sx={{ color: "#2563EB" }}
                        >
                          {guardando ? (
                            <CircularProgress
                              size={14}
                              sx={{ color: "#2563EB" }}
                            />
                          ) : (
                            <CheckIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Cancelar (Esc)">
                      <IconButton
                        size="small"
                        onClick={handleCancelarEdicion}
                        sx={{ color: "#94A3B8" }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "#0F172A",
                        fontSize: "14px",
                        lineHeight: "1.3",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 1,
                      }}
                    >
                      {capitulo.nombre}
                    </Typography>

                    {/* Métricas + badge Canvas */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span style={{ fontSize: 11, color: "#94A3B8" }}>
                        {nClases} clase{nClases !== 1 ? "s" : ""} · {nTemas}{" "}
                        tema{nTemas !== 1 ? "s" : ""}
                      </span>
                      {syncCount > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            background: "#DCFCE7",
                            color: "#166534",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          Canvas ✓
                        </span>
                      )}
                      {tieneErrores && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            background: "#FEE2E2",
                            color: "#991B1B",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          Error
                        </span>
                      )}
                      {tienePending && !tieneErrores && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            background: "#FEF9C3",
                            color: "#854D0E",
                            borderRadius: 4,
                            padding: "1px 6px",
                          }}
                        >
                          Pendiente
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Acciones de gestión */}
              {!editando && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {/* Toggle Canvas */}
                  <Tooltip
                    title={`Canvas: ${capitulo.published_canvas ? "publicado" : "oculto"}`}
                  >
                    <span>
                      {togglingCanvas ? (
                        <CircularProgress
                          size={14}
                          sx={{ color: "#2563EB", mx: 0.5 }}
                        />
                      ) : (
                        <IconButton
                          size="small"
                          onClick={handleToggleCanvas}
                          disabled={togglingApi}
                          sx={
                            capitulo.published_canvas
                              ? iconBtnActiveSx
                              : iconBtnSx
                          }
                        >
                          <SchoolIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>

                  {/* Toggle API */}
                  <Tooltip
                    title={`Plataforma: ${capitulo.published_api ? "publicado" : "oculto"}`}
                  >
                    <span>
                      {togglingApi ? (
                        <CircularProgress
                          size={14}
                          sx={{ color: "#2563EB", mx: 0.5 }}
                        />
                      ) : (
                        <IconButton
                          size="small"
                          onClick={handleToggleApi}
                          disabled={togglingCanvas}
                          sx={
                            capitulo.published_api ? iconBtnActiveSx : iconBtnSx
                          }
                        >
                          {capitulo.published_api ? (
                            <PublicIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <PublicOffIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      )}
                    </span>
                  </Tooltip>

                  {/* Menú ⋯ */}
                  <IconButton
                    size="small"
                    onClick={(e) => setMenuAnchor(e.currentTarget)}
                    sx={iconBtnSx}
                  >
                    <MoreHorizIcon sx={{ fontSize: 15 }} />
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
                      sx={{
                        gap: 1.5,
                        py: 1.2,
                        "&:hover": { bgcolor: "#F8FAFC" },
                      }}
                    >
                      <ListItemIcon>
                        <EditOutlinedIcon
                          sx={{ fontSize: 15, color: "#2563EB" }}
                        />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ color: "#334155" }}>
                        Editar
                      </Typography>
                    </MenuItem>
                    <Divider sx={{ borderColor: "#F1F5F9", my: 0.5 }} />
                    <MenuItem
                      onClick={handleEliminar}
                      sx={{
                        gap: 1.5,
                        py: 1.2,
                        "&:hover": { bgcolor: "#FFF5F5" },
                      }}
                    >
                      <ListItemIcon>
                        <DeleteOutlineIcon
                          sx={{ fontSize: 15, color: "#EF4444" }}
                        />
                      </ListItemIcon>
                      <Typography variant="body2" sx={{ color: "#EF4444" }}>
                        Eliminar
                      </Typography>
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>

            {/* Zona derecha: navegación — 52px separada */}
            {!editando && (
              <button
                onClick={handleNavegar}
                aria-label="Ver clases del capítulo"
                style={{
                  width: 52,
                  background: "#F8FAFC",
                  border: "none",
                  borderLeft: "0.5px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#CBD5E1",
                  flexShrink: 0,
                  transition:
                    "background 0.15s, color 0.15s, border-left-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.style.background = "#EFF6FF";
                  btn.style.color = "#2563EB";
                  btn.style.borderLeftColor = "#BFDBFE";
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.style.background = "#F8FAFC";
                  btn.style.color = "#CBD5E1";
                  btn.style.borderLeftColor = "#F1F5F9";
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 17 }} />
              </button>
            )}
          </div>
        </CardContent>
        <div style={{ display: "flex", alignItems: "stretch" }}></div>
      </Card>

      {modalEliminar && (
        <ModalEliminarCapitulo
          capitulo={capitulo}
          onClose={() => setModalEliminar(false)}
        />
      )}
    </>
  );
};

export default CapituloCard;
