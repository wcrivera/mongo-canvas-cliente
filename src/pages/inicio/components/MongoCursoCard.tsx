// src/pages/inicio/components/MongoCursoCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import SyncIcon from "@mui/icons-material/Sync";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { AddCircleOutlineOutlined } from "@mui/icons-material";

import { useAppDispatch } from "../../../store/hooks";
import { editarPublishedApiCurso } from "../../../store/slices/mongoCurso";
import type { IMongoCurso } from "../../../store/slices/mongoCurso";
import CanvasCursoChip from "./CanvasCursoChip";
import ModalAsociarCanvas from "./ModalAsociarCanvas";
import ModalSincronizar from "./ModalSincronizar";

interface Props {
  curso: IMongoCurso;
  onEditar: (curso: IMongoCurso) => void;
  onEliminar: (curso: IMongoCurso) => void;
}

// Estilos compartidos para los icon-buttons con borde
const iconBtnSx = {
  width: 32,
  height: 32,
  borderRadius: "8px",
  border: "0.5px solid #E2E8F0",
  bgcolor: "#F8FAFC",
  color: "#94A3B8",
  "&:hover": { bgcolor: "#F1F5F9", color: "#475569", borderColor: "#CBD5E1" },
};

const iconBtnActiveSx = {
  ...iconBtnSx,
  color: "#16A34A",
  bgcolor: "#EFF6FF",
  borderColor: "#BFDBFE",
  "&:hover": { bgcolor: "#DBEAFE", color: "#16A34A", borderColor: "#93C5FD" },
};

const syncBtnSx = {
  width: 28,
  height: 28,
  borderRadius: "6px",
  border: "0.5px solid #E2E8F0",
  bgcolor: "#F8FAFC",
  color: "#94A3B8",
  flexShrink: 0,
  "&:hover": { bgcolor: "#EFF6FF", color: "#16A34A", borderColor: "#BFDBFE" },
};

const MongoCursoCard = ({ curso, onEditar, onEliminar }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [modalAsociar, setModalAsociar] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [modalSync, setModalSync] = useState<{
    abierto: boolean;
    canvas_curso_id: number;
    canvas_nombre: string;
  }>({ abierto: false, canvas_curso_id: 0, canvas_nombre: "" });

  const canvasActivos = curso.canvas_cursos.filter((c) => c.activo);
  const canvasInactivos = curso.canvas_cursos.filter((c) => !c.activo);
  const totalCanvas = curso.canvas_cursos.length;

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarPublishedApiCurso({
        curso_id: curso._id,
        published_api: !curso.published_api,
      }),
    );
    setTogglingApi(false);
  };

  const handleEditar = () => {
    setMenuAnchor(null);
    onEditar(curso);
  };

  const handleEliminar = () => {
    setMenuAnchor(null);
    onEliminar(curso);
  };

  const handleSync = (canvas_curso_id: number, canvas_nombre: string) => {
    setModalSync({ abierto: true, canvas_curso_id, canvas_nombre });
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "0.5px solid #E2E8F0",
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          transition: "box-shadow 0.15s, transform 0.15s",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <CardContent
          sx={{ p: 0, display: "flex", flexDirection: "column", flex: 1 }}
        >
          {/* ── Header ── */}
          <div className="px-4 pt-4 pb-3">
            {/* Fila: código + acciones */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-[#EFF6FF] text-[#0C447C]">
                {curso.codigo}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Toggle visibilidad */}
                <Tooltip
                  title={
                    curso.published_api
                      ? "Publicado — click para ocultar"
                      : "Oculto — click para publicar"
                  }
                >
                  <span className="flex items-center">
                    {togglingApi ? (
                      <CircularProgress
                        size={14}
                        sx={{ color: "#2563EB", mx: 1 }}
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleToggleApi}
                        sx={curso.published_api ? iconBtnActiveSx : iconBtnSx}
                      >
                        {curso.published_api ? (
                          <PublicIcon sx={{ fontSize: 17 }} />
                        ) : (
                          <PublicOffIcon sx={{ fontSize: 17 }} />
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
                    onClick={handleEditar}
                    sx={{
                      gap: 1.5,
                      py: 1.2,
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    <ListItemIcon>
                      <EditOutlinedIcon
                        sx={{ fontSize: 16, color: "#2563EB" }}
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
                      <DeleteOutlineOutlinedIcon
                        sx={{ fontSize: 16, color: "#EF4444" }}
                      />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ color: "#EF4444" }}>
                      Eliminar
                    </Typography>
                  </MenuItem>
                </Menu>
              </div>
            </div>

            {/* Título */}
            <Typography
              variant="subtitle1"
              sx={{
                color: "#1E293B",
                fontWeight: 500,
                fontSize: "15px",
                lineHeight: 1.35,
                mb: curso.descripcion ? 0.75 : 0,
              }}
            >
              {curso.nombre}
            </Typography>

            {/* Descripción — máx. 2 líneas */}
            {/* {curso.descripcion && (
              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",
                  fontSize: "12px",
                  lineHeight: 1.55,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {curso.descripcion}
              </Typography>
            )} */}
          </div>

          <Divider sx={{ borderColor: "#F1F5F9" }} />

          {/* ── Sección Canvas ── */}
          <div className="px-4 pt-3 pb-3 flex flex-col gap-2.5 flex-1">
            {/* Subheader */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SchoolIcon sx={{ fontSize: 14, color: "#2563EB" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontWeight: 700,
                    fontSize: "10px",
                  }}
                >
                  Cursos Canvas ({canvasActivos.length})
                </Typography>
              </div>

              {/* Asociar con borde azul */}
              <Button
                size="small"
                startIcon={
                  <AddCircleOutlineOutlined
                    sx={{ fontSize: "13px !important" }}
                  />
                }
                onClick={() => setModalAsociar(true)}
                sx={{
                  color: "#2563EB",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "6px",
                  px: 1.5,
                  py: 0.5,
                  minWidth: 0,
                  textTransform: "none",
                  border: "0.5px solid #BFDBFE",
                  bgcolor: "transparent",
                  "&:hover": { bgcolor: "#EFF6FF", borderColor: "#93C5FD" },
                }}
              >
                Asociar
              </Button>
            </div>

            {/* Empty state */}
            {totalCanvas === 0 && (
              <div className="flex flex-col items-center gap-2 py-5 rounded-lg border border-dashed border-[#E2E8F0]">
                <SchoolIcon sx={{ fontSize: 24, color: "#CBD5E1" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "#CBD5E1", fontSize: "11px" }}
                >
                  Sin cursos Canvas asociados
                </Typography>
              </div>
            )}

            {/* Lista con scroll cuando hay muchos items */}
            {totalCanvas > 0 && (
              <div
                className="flex flex-col gap-2 overflow-y-auto"
                style={{
                  maxHeight: "130px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#E2E8F0 transparent",
                }}
              >
                {/* Activos */}
                {canvasActivos.map((cc) => (
                  <div
                    key={cc.canvas_id}
                    className="flex items-center gap-2 border border-[#E2E8F0] rounded-lg px-3 py-2 shrink-0"
                  >
                    <div className="flex-1 min-w-0">
                      <CanvasCursoChip curso_id={curso._id} canvasCurso={cc} />
                    </div>
                    <Tooltip title="Sincronizar contenido">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleSync(
                            cc.canvas_id,
                            cc.nombre ?? `Canvas ${cc.canvas_id}`,
                          )
                        }
                        sx={syncBtnSx}
                      >
                        <SyncIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}

                {/* Inactivos — opacidad reducida */}
                {canvasInactivos.map((cc) => (
                  <div
                    key={cc.canvas_id}
                    className="flex items-center gap-2 border border-[#E2E8F0] rounded-lg px-3 py-2 opacity-45 shrink-0"
                  >
                    <div className="flex-1 min-w-0">
                      <CanvasCursoChip curso_id={curso._id} canvasCurso={cc} />
                    </div>
                    <Tooltip title="Sincronizar contenido">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleSync(
                            cc.canvas_id,
                            cc.nombre ?? `Canvas ${cc.canvas_id}`,
                          )
                        }
                        sx={syncBtnSx}
                      >
                        <SyncIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer: status + Ver curso — siempre anclado abajo ── */}
          <div className="px-4 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-end mt-auto">
            <Button
              size="small"
              endIcon={
                <ArrowForwardIcon sx={{ fontSize: "13px !important" }} />
              }
              onClick={() => navigate(`/cursos/${curso._id}/capitulos`)}
              sx={{
                color: "#2563EB",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "6px",
                px: 1.5,
                py: 0.5,
                minWidth: 0,
                textTransform: "none",
                border: "0.5px solid #BFDBFE",
                bgcolor: "transparent",
                "&:hover": { bgcolor: "#EFF6FF", borderColor: "#93C5FD" },
              }}
            >
              Ver curso
            </Button>
          </div>
        </CardContent>
      </Card>

      {modalAsociar && (
        <ModalAsociarCanvas
          curso_id={curso._id}
          onClose={() => setModalAsociar(false)}
        />
      )}

      {modalSync.abierto && (
        <ModalSincronizar
          curso_id={curso._id}
          canvas_curso_id={modalSync.canvas_curso_id}
          canvas_nombre={modalSync.canvas_nombre}
          onClose={() =>
            setModalSync({
              abierto: false,
              canvas_curso_id: 0,
              canvas_nombre: "",
            })
          }
        />
      )}
    </>
  );
};

export default MongoCursoCard;
