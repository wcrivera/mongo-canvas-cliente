// src/pages/inicio/components/MongoCursoCard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import SyncIcon from "@mui/icons-material/Sync";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SchoolIcon from "@mui/icons-material/School";

import { useAppDispatch } from "@/store/hooks";
import { editarPublishedApiCurso } from "@/store/slices/mongoCurso";
import type { IMongoCurso } from "@/store/slices/mongoCurso";
import CanvasCursoChip from "./CanvasCursoChip";
import ModalAsociarCanvas from "./ModalAsociarCanvas";
import ModalSincronizar from "./ModalSincronizar";
import { iconBtnActiveSx, iconBtnSx } from "@/styles/iconButtons";

// ── Paleta de 6 colores cíclica ───────────────────────────────────────────────
const COLOR_PALETTE = [
  {
    border: "#2563EB",
    pillBg: "#EFF6FF",
    pillBorder: "#BFDBFE",
    pillText: "#1E3A8A",
    accent: "#2563EB",
  },
  {
    border: "#7C3AED",
    pillBg: "#F5F3FF",
    pillBorder: "#DDD6FE",
    pillText: "#4C1D95",
    accent: "#7C3AED",
  },
  {
    border: "#0D9488",
    pillBg: "#F0FDFA",
    pillBorder: "#99F6E4",
    pillText: "#134E4A",
    accent: "#0D9488",
  },
  {
    border: "#D97706",
    pillBg: "#FFFBEB",
    pillBorder: "#FDE68A",
    pillText: "#78350F",
    accent: "#D97706",
  },
  {
    border: "#DB2777",
    pillBg: "#FDF2F8",
    pillBorder: "#FBCFE8",
    pillText: "#831843",
    accent: "#DB2777",
  },
  {
    border: "#475569",
    pillBg: "#F8FAFC",
    pillBorder: "#CBD5E1",
    pillText: "#1E293B",
    accent: "#475569",
  },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  curso: IMongoCurso;
  index: number;
  onEditar: (curso: IMongoCurso) => void;
  onEliminar: (curso: IMongoCurso) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────
const MongoCursoCard = ({ curso, index, onEditar, onEliminar }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const color = COLOR_PALETTE[index % COLOR_PALETTE.length];

  const [modalAsociar, setModalAsociar] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [modalSync, setModalSync] = useState<{
    abierto: boolean;
    canvas_curso_id: number;
    canvas_nombre: string;
  }>({ abierto: false, canvas_curso_id: 0, canvas_nombre: "" });

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
  const handleSync = (canvas_curso_id: number, canvas_nombre: string) =>
    setModalSync({ abierto: true, canvas_curso_id, canvas_nombre });

  return (
    <>
      <Card
        elevation={1}
        sx={{
          borderRadius: "14px",
          border: "0.5px solid #E2E8F0",
          borderLeft: `3px solid ${color.border}`,
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          transition: "box-shadow 0.15s, transform 0.15s",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <CardContent
          sx={{ p: 0, display: "flex", flexDirection: "column", flex: 1 }}
        >
          {/* ── ZONA 1: Identidad ── */}
          <div style={{ padding: "16px 16px 14px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    padding: "2px 8px",
                    borderRadius: 5,
                    background: color.pillBg,
                    border: `0.5px solid ${color.pillBorder}`,
                    color: color.pillText,
                    marginBottom: 7,
                  }}
                >
                  {curso.codigo}
                </span>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                    lineHeight: 1.3,
                    fontFamily: "Georgia, serif",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {curso.nombre}
                </p>
              </div>

              {/* Acciones */}
              <div
                style={{ display: "flex", gap: 4, flexShrink: 0, marginTop: 2 }}
              >
                <Tooltip
                  title={
                    curso.published_api
                      ? "Publicado en plataforma — click para ocultar"
                      : "Oculto — click para publicar"
                  }
                >
                  <span>
                    {togglingApi ? (
                      <CircularProgress
                        size={14}
                        sx={{ color: color.accent, mx: 0.5, mt: 0.75 }}
                      />
                    ) : (
                      <IconButton
                        size="small"
                        onClick={handleToggleApi}
                        sx={curso.published_api ? iconBtnActiveSx : iconBtnSx}
                      >
                        {curso.published_api ? (
                          <PublicIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <PublicOffIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>
                    )}
                  </span>
                </Tooltip>

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
                        minWidth: 160,
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
                      py: 1,
                      fontSize: 13,
                      "&:hover": { bgcolor: "#F8FAFC" },
                    }}
                  >
                    <ListItemIcon>
                      <EditOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#2563EB" }}
                      />
                    </ListItemIcon>
                    Editar
                  </MenuItem>
                  <MenuItem
                    onClick={handleEliminar}
                    sx={{
                      gap: 1.5,
                      py: 1,
                      fontSize: 13,
                      "&:hover": { bgcolor: "#FFF5F5" },
                    }}
                  >
                    <ListItemIcon>
                      <DeleteOutlineOutlinedIcon
                        fontSize="small"
                        sx={{ color: "#EF4444" }}
                      />
                    </ListItemIcon>
                    <span style={{ color: "#EF4444" }}>Eliminar</span>
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </div>

          {/* ── ZONA 2: Canvas ── */}
          <div
            style={{
              background: "#F8FAFC",
              borderTop: "0.5px solid #F1F5F9",
              borderBottom: "0.5px solid #F1F5F9",
              padding: "10px 16px",
              flex: 1,
            }}
          >
            {/* Header de sección */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <SchoolIcon sx={{ fontSize: 12, color: "#94A3B8" }} />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#94A3B8",
                  }}
                >
                  Canvas
                </span>
                <span
                  style={{
                    background: "#E2E8F0",
                    color: "#475569",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 20,
                    padding: "0 6px",
                    lineHeight: "18px",
                  }}
                >
                  {totalCanvas}
                </span>
              </div>
              <button
                onClick={() => setModalAsociar(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  color: color.accent,
                  background: "white",
                  border: `0.5px solid ${color.pillBorder}`,
                  borderRadius: 6,
                  padding: "3px 9px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Asociar
              </button>
            </div>

            {/* Lista */}
            {totalCanvas === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "8px 0 4px",
                  color: "#CBD5E1",
                  fontSize: 11,
                }}
              >
                Sin cursos Canvas asociados
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 120,
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#E2E8F0 transparent",
                }}
              >
                {curso.canvas_cursos.map((cc) => (
                  <div
                    key={cc.canvas_id}
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <CanvasCursoChip curso_id={curso._id} canvasCurso={cc} />
                    </div>
                    <Tooltip title="Sincronizar">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleSync(
                            cc.canvas_id,
                            cc.nombre ?? `Canvas ${cc.canvas_id}`,
                          )
                        }
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "6px",
                          border: "0.5px solid #E2E8F0",
                          bgcolor: "white",
                          color: "#94A3B8",
                          flexShrink: 0,
                          "&:hover": {
                            bgcolor: color.pillBg,
                            color: color.accent,
                            borderColor: color.pillBorder,
                          },
                        }}
                      >
                        <SyncIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        {/* ── ZONA 3: CTA ── */}
        <button
          onClick={() => navigate(`/cursos/${curso._id}/capitulos`)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            color: color.accent,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              color.pillBg;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          Ver curso <span style={{ fontSize: 15, lineHeight: 1 }}>→</span>
        </button>
      </Card>

      {/* ── Modales ── */}
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
