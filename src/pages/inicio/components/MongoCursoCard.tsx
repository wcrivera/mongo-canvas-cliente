// src/pages/inicio/MongoCursoCard.tsx
import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, IconButton,
  Tooltip, Typography, Divider, Button,
} from "@mui/material";
import EditOutlinedIcon              from "@mui/icons-material/EditOutlined";
import ArrowForwardIcon              from "@mui/icons-material/ArrowForward";
import SchoolIcon                    from "@mui/icons-material/School";
import SyncIcon                      from "@mui/icons-material/Sync";
import { AddCircleOutlineOutlined, DeleteOutlineOutlined } from "@mui/icons-material";
import type { IMongoCurso }          from "../../../store/slices/mongoCurso";
import CanvasCursoChip               from "./CanvasCursoChip";
import ModalAsociarCanvas            from "./ModalAsociarCanvas";
import ModalSincronizar              from "./ModalSincronizar";

interface Props {
  curso:      IMongoCurso;
  onEditar:   (curso: IMongoCurso) => void;
  onEliminar: (curso: IMongoCurso) => void; // ← ahora recibe el curso completo
}

const MongoCursoCard = ({ curso, onEditar, onEliminar }: Props) => {
  const navigate = useNavigate();

  const [modalAsociar, setModalAsociar] = useState(false);
  const [verInactivos, setVerInactivos] = useState(false);
  const [modalSync, setModalSync]       = useState<{
    abierto:         boolean;
    canvas_curso_id: number;
    canvas_nombre:   string;
  }>({ abierto: false, canvas_curso_id: 0, canvas_nombre: "" });

  const canvasActivos   = curso.canvas_cursos.filter((c) => c.activo);
  const canvasInactivos = curso.canvas_cursos.filter((c) => !c.activo);

  return (
    <>
      <Card
        elevation={0}
        className="animate-fadeIn"
        sx={{
          borderRadius: 3,
          border: "1px solid #d9e4ee",
          transition: "box-shadow 0.2s, transform 0.2s",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(74,109,140,0.12)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>

          {/* ── Zona superior: datos Mongo ── */}
          <div
            className="flex items-start justify-between gap-2 px-5 pt-5 pb-4"
            style={{
              background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
            }}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span
                className="inline-flex items-center self-start rounded-full px-3 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#d9e4ee", color: "#3c5770" }}
              >
                {curso.codigo}
              </span>
              <Typography
                variant="subtitle1"
                sx={{ color: "#1f2c38", lineHeight: 1.3, fontWeight: 600 }}
              >
                {curso.nombre}
              </Typography>
              {curso.descripcion && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6793ba",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {curso.descripcion}
                </Typography>
              )}
            </div>

            {/* Acciones */}
            <div className="flex shrink-0 gap-0.5">
              <Tooltip title="Editar curso">
                <IconButton
                  size="small"
                  onClick={() => onEditar(curso)}
                  sx={{
                    color: "#8daecb",
                    "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar curso">
                <IconButton
                  size="small"
                  onClick={() => onEliminar(curso)} // ← pasa el curso completo
                  sx={{
                    color: "#8daecb",
                    "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                  }}
                >
                  <DeleteOutlineOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ver capítulos">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/cursos/${curso._id}/capitulos`)}
                  sx={{
                    color: "#8daecb",
                    "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <Divider sx={{ borderColor: "#d9e4ee" }} />

          {/* ── Zona inferior: cursos Canvas ── */}
          <div className="flex flex-col gap-2 px-5 pt-4 pb-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <SchoolIcon sx={{ fontSize: 14, color: "#8daecb" }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6793ba",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Cursos Canvas ({canvasActivos.length})
                </Typography>
              </div>
              <Button
                size="small"
                startIcon={<AddCircleOutlineOutlined />}
                onClick={() => setModalAsociar(true)}
                sx={{
                  color: "#4A6D8C",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1.5,
                  "&:hover": { bgcolor: "#f0f4f8" },
                }}
              >
                Asociar
              </Button>
            </div>

            {/* Sin asociaciones */}
            {canvasActivos.length === 0 && canvasInactivos.length === 0 && (
              <div className="flex flex-col items-center gap-1 py-4 rounded-xl border border-dashed border-[#b3c9dd]">
                <SchoolIcon sx={{ fontSize: 28, color: "#b3c9dd" }} />
                <Typography variant="caption" sx={{ color: "#8daecb" }}>
                  Sin cursos Canvas asociados
                </Typography>
              </div>
            )}

            {/* Activos */}
            <div className="flex flex-col gap-2">
              {canvasActivos.map((cc) => (
                <div key={cc.canvas_id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <CanvasCursoChip curso_id={curso._id} canvasCurso={cc} />
                  </div>
                  <Tooltip title="Sincronizar contenido">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setModalSync({
                          abierto:         true,
                          canvas_curso_id: cc.canvas_id,
                          canvas_nombre:   cc.nombre ?? `Canvas ${cc.canvas_id}`,
                        })
                      }
                      sx={{
                        color: "#8daecb",
                        flexShrink: 0,
                        "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                      }}
                    >
                      <SyncIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>

            {/* Inactivos colapsados */}
            {canvasInactivos.length > 0 && (
              <div className="mt-1">
                <button
                  onClick={() => setVerInactivos((v) => !v)}
                  className="text-xs text-[#8daecb] hover:text-[#4A6D8C] transition-colors"
                >
                  {verInactivos ? "▲" : "▼"} {canvasInactivos.length} inactivo
                  {canvasInactivos.length > 1 ? "s" : ""}
                </button>
                {verInactivos && (
                  <div className="flex flex-col gap-2 mt-2 animate-slideDown">
                    {canvasInactivos.map((cc) => (
                      <div key={cc.canvas_id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <CanvasCursoChip curso_id={curso._id} canvasCurso={cc} />
                        </div>
                        <Tooltip title="Sincronizar contenido">
                          <IconButton
                            size="small"
                            onClick={() =>
                              setModalSync({
                                abierto:         true,
                                canvas_curso_id: cc.canvas_id,
                                canvas_nombre:   cc.nombre ?? `Canvas ${cc.canvas_id}`,
                              })
                            }
                            sx={{
                              color: "#8daecb",
                              flexShrink: 0,
                              "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                            }}
                          >
                            <SyncIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal asociar */}
      {modalAsociar && (
        <ModalAsociarCanvas
          curso_id={curso._id}
          onClose={() => setModalAsociar(false)}
        />
      )}

      {/* Modal sincronizar */}
      {modalSync.abierto && (
        <ModalSincronizar
          curso_id={curso._id}
          canvas_curso_id={modalSync.canvas_curso_id}
          canvas_nombre={modalSync.canvas_nombre}
          onClose={() =>
            setModalSync({ abierto: false, canvas_curso_id: 0, canvas_nombre: "" })
          }
        />
      )}
    </>
  );
};

export default MongoCursoCard;