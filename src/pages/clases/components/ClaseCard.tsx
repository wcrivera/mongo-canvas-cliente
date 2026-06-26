// src/pages/clases/components/ClaseCard.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ClassIcon from "@mui/icons-material/Class";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { editarClase } from "@/store/slices/clase";
import { cambiarPositionTema } from "@/store/slices/tema";
import type { IClase } from "@/store/slices/clase";
import SortableTemaRow from "./SortableTemaRow";
import { ModalEliminarClase } from "./ModalEliminarClase";
import ModalCrearTema from "./ModalCrearTema";
import { iconBtnActiveSx, iconBtnSx } from "@/styles/iconButtons";

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  index: number;
  clase: IClase;
  capitulo_id: string;
  curso_id: string;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// ── Componente ────────────────────────────────────────────────────────────────
const ClaseCard = ({
  index,
  clase,
  capitulo_id,
  isDragging = false,
  dragHandleProps = {},
}: Props) => {
  const dispatch = useAppDispatch();

  const { temas } = useAppSelector((s) => s.temaMongo);
  const temasClase = temas
    .filter((t) => t.clase_id?.toString() === clase._id.toString())
    .sort((a, b) => a.position - b.position);

  // ── Estado ────────────────────────────────────────────────────────────────
  const [modalEliminar, setModalEliminar] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(clase.nombre);
  const [guardando, setGuardando] = useState(false);
  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [mostrarFormTema, setMostrarFormTema] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ── Canvas status ─────────────────────────────────────────────────────────
  const syncCount = clase.canvas_deployments.filter(
    (d) => d.status === "synced",
  ).length;
  // const hasContent = temasClase.length > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    if (e.key === "Enter") handleGuardarNombre();
    if (e.key === "Escape") {
      setNombre(clase.nombre);
      setEditando(false);
    }
  };

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(
      editarClase({
        clase_id: clase._id,
        published_canvas: !clase.published_canvas,
      }),
    );
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarClase({ clase_id: clase._id, published_api: !clase.published_api }),
    );
    setTogglingApi(false);
  };

  const handleAbrirEliminar = () => {
    setMenuAnchor(null);
    setModalEliminar(true);
  };

  const handleDragEndTemas = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = temasClase.findIndex((t) => t._id === active.id);
    const newIndex = temasClase.findIndex((t) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionTema({ tema_id: String(active.id), direction }),
      );
    }
  };

  const temaIds = temasClase.map((t) => t._id);

  return (
    <>
      <Card
        elevation={1}
        sx={{
          borderRadius: "12px",
          border: "0.5px solid #E2E8F0",
          bgcolor: "white",
          overflow: "hidden",
          transition: "box-shadow 0.15s",
          "&:hover": {
            boxShadow: isDragging
              ? "0 8px 24px rgba(0,0,0,0.12)"
              : "0 4px 16px rgba(0,0,0,0.07)",
          },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* ── Header de clase ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 14px",
            }}
          >
            {/* Drag handle */}
            <div
              {...dragHandleProps}
              style={{
                color: "#CBD5E1",
                cursor: "grab",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                touchAction: "none",
              }}
              aria-label="Arrastrar para reordenar"
            >
              <DragIndicatorIcon sx={{ fontSize: 24 }} />
            </div>

            {/* Número */}
            {/* <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: hasContent ? "#EFF6FF" : "#F8FAFC",
                border: `0.5px solid ${hasContent ? "#BFDBFE" : "#E2E8F0"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: hasContent ? "#1E3A8A" : "#94A3B8",
                flexShrink: 0,
              }}
            >
              {clase.position}
            </div> */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0,
                background: "#2563EB18",
                border: "0.5px solid #2563EB40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClassIcon sx={{ fontSize: 20, color: "#2563EB" }} />
            </div>

            {/* Nombre / editor */}
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
                  <Tooltip title="Guardar">
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
                  <Tooltip title="Cancelar">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setNombre(clase.nombre);
                        setEditando(false);
                      }}
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
                      fontWeight: 600,
                      color: "gray",
                      fontSize: "14px",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      mb: 0.6,
                    }}
                  >
                    Clase {index + 1}
                  </Typography>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 200,
                        color: "#0F172A",
                        fontSize: "13px",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        mb: 0.3,
                      }}
                    >
                      {clase.nombre}
                    </Typography>
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
                  </div>
                </>
              )}
            </div>

            {/* Acciones */}
            {!editando && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Tooltip
                  title={`Canvas: ${clase.published_canvas ? "publicado" : "oculto"}`}
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
                        sx={
                          clase.published_canvas ? iconBtnActiveSx : iconBtnSx
                        }
                      >
                        <SchoolIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </span>
                </Tooltip>
                <Tooltip
                  title={`Plataforma: ${clase.published_api ? "publicado" : "oculto"}`}
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
                        sx={clase.published_api ? iconBtnActiveSx : iconBtnSx}
                      >
                        {clase.published_api ? (
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
                        minWidth: 150,
                        borderRadius: "8px",
                        border: "0.5px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setMenuAnchor(null);
                      setEditando(true);
                    }}
                    sx={{
                      gap: 1.5,
                      py: 1,
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
                    onClick={handleAbrirEliminar}
                    sx={{
                      gap: 1.5,
                      py: 1,
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

          {/* ── Temas ── */}
          <div style={{ background: "#FAFAFA" }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEndTemas}
            >
              <SortableContext
                items={temaIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col">
                  {temasClase.map((tema, indexTema) => (
                    <SortableTemaRow
                      key={tema._id}
                      tema={tema}
                      capitulo_id={capitulo_id}
                      indexClase={index}
                      indexTema={indexTema}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>

        {/* ── Agregar tema — footer independiente (tu diseño) ── */}
        <div style={{ borderTop: "1px solid #E2E8F0" }}>
          <button
            onClick={() => setMostrarFormTema(true)}
            style={{ fontSize: 12, cursor: "pointer" }}
            className="w-full flex items-center px-4 justify-start gap-2 py-3 text-[13px] text-[#94A3B8] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
          >
            <AddIcon sx={{ fontSize: 15 }} />
            Agregar tema
          </button>
        </div>
      </Card>

      {/* ── Modal eliminar clase ── */}
      {modalEliminar && (
        <ModalEliminarClase
          clase={clase}
          onClose={() => setModalEliminar(false)}
        />
      )}
      {mostrarFormTema && (
        <ModalCrearTema
          clase_id={clase._id}
          onClose={() => setMostrarFormTema(false)}
        />
      )}
    </>
  );
};

export default ClaseCard;
