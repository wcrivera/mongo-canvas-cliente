// src/pages/ejercicios/components/EjercicioCard.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
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
import EditNoteIcon from "@mui/icons-material/EditNote";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAppDispatch } from "@/store/hooks";
import {
  editarQuiz,
  editarPregunta,
  type IQuiz,
  type IPregunta,
} from "@/store/slices/quiz";
import { reintentarEjercicio } from "@/store/slices/ejercicio";
import { iconBtnSx, iconBtnActiveSx } from "@/styles/iconButtons";
import { PreguntaViewer, PreguntaEditor } from "@/components/quiz";
import type {
  IOpcionEditor,
  IParEditor,
  IRespuestaNumEditor,
  TipoPreguntaEditor,
} from "@/components/quiz";
import type {
  IItemFIBEditor,
  IDropdownBlancoEditorForm,
  TipoPimu,
} from "@/components/quiz/PreguntaEditor";
import type { IItemFIBViewer } from "@/components/quiz/PreguntaViewer";
import ModalEliminar from "./ModalEliminar";
import FormPregunta from "../../quiz/components/FormPregunta";
import { obtenerPreguntas } from "@/store/slices/quiz";
import { normalizeForEditor, cleanForDB } from "@/components/CKEditor/mathUtils";

// ── Colores por tipo ──────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  multiple_choice: "Opción múltiple",
  multiple_answers: "Respuestas múltiples",
  true_false: "Verdadero / Falso",
  short_answer: "Respuesta corta",
  essay: "Ensayo",
  matching: "Pareo",
  numerical: "Numérico",
  fill_in_multiple_blanks: "Completar",
  multiple_dropdowns: "Listas desplegables",
  text_only_question: "Solo texto",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice: "#2563EB",
  multiple_answers: "#7C3AED",
  true_false: "#0D9488",
  short_answer: "#475569",
  essay: "#475569",
  matching: "#D97706",
  numerical: "#DB2777",
  fill_in_multiple_blanks: "#EA580C",
  multiple_dropdowns: "#0D9488",
  text_only_question: "#94a3b8",
};

// ── Helpers: unificar schemas FIB ─────────────────────────────────────────────

const normalizeColumnas = (c: number | undefined): 1 | 2 | 3 =>
  Math.max(1, Math.min(3, Number(c) || 1)) as 1 | 2 | 3;

const getItemsEditor = (pregunta: IPregunta): IItemFIBEditor[] => {
  if (Array.isArray(pregunta.items) && pregunta.items.length > 0) {
    return pregunta.items.map((it) => ({
      id: it.id,
      enunciado: it.enunciado ?? "",
      respuesta: it.respuesta,
      tipoPimu: (it.tipo_pimu as TipoPimu) ?? "numero",
    }));
  }
  // Schema viejo: reconstruir desde opciones[] con blank_id
  const vistos = new Set<string>();
  return (pregunta.opciones ?? [])
    .filter((op) => {
      if (!op.blank_id) return false;
      const nuevo = !vistos.has(op.blank_id);
      vistos.add(op.blank_id);
      return nuevo;
    })
    .map((op) => ({
      id: op.blank_id!,
      enunciado: "",
      respuesta: op.texto,
      tipoPimu: (op.tipo_pimu as TipoPimu) ?? "numero",
    }));
};

const getItemsViewer = (pregunta: IPregunta): IItemFIBViewer[] => {
  if (Array.isArray(pregunta.items) && pregunta.items.length > 0) {
    return pregunta.items.map((it) => ({
      id: it.id,
      enunciado: it.enunciado ?? "",
      respuesta: it.respuesta,
      tipo_pimu: it.tipo_pimu,
    }));
  }
  const vistos = new Set<string>();
  return (pregunta.opciones ?? [])
    .filter((op) => {
      if (!op.blank_id) return false;
      const nuevo = !vistos.has(op.blank_id);
      vistos.add(op.blank_id);
      return nuevo;
    })
    .map((op) => ({
      id: op.blank_id!,
      enunciado: "",
      respuesta: op.texto,
      tipo_pimu: op.tipo_pimu ?? "numero",
    }));
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  ejercicio: IQuiz;
  preguntas: IPregunta[];
  index: number;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// ── EjercicioCard ─────────────────────────────────────────────────────────────

const EjercicioCard = ({
  ejercicio,
  preguntas,
  index,
  isDragging = false,
  dragHandleProps = {},
}: Props) => {
  const dispatch = useAppDispatch();

  // La primera (y única) pregunta del ejercicio
  const pregunta = preguntas[0];
  const esFIB = pregunta?.tipo === "fill_in_multiple_blanks";

  // ── Estado ────────────────────────────────────────────────────────────────
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [togglingCanvas, setTogglingCanvas] = useState(false);
  const [togglingApi, setTogglingApi] = useState(false);

  // Estado del editor — inicializado desde la pregunta
  const [enunciado, setEnunciado] = useState(
    esFIB
      ? pregunta?.enunciado_contexto || pregunta?.enunciado || ""
      : (pregunta?.enunciado ?? ""),
  );

  const [puntos, setPuntos] = useState(pregunta?.puntos ?? 1);
  const [opciones, setOpciones] = useState<IOpcionEditor[]>(
    (pregunta?.opciones ?? []).map((op) => ({
      texto: op.texto,
      es_correcta: op.es_correcta,
      blank_id: op.blank_id ?? null,
    })),
  );

  const [pares, setPares] = useState<IParEditor[]>(
    (pregunta?.pares ?? []).map((p) => ({
      izquierda: p.izquierda,
      derecha: p.derecha,
    })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumEditor>({
    tipo: pregunta?.respuesta_numerica?.tipo ?? "exact",
    exacto: pregunta?.respuesta_numerica?.exacto ?? 0,
    margen: pregunta?.respuesta_numerica?.margen ?? 0,
    minimo: pregunta?.respuesta_numerica?.minimo ?? 0,
    maximo: pregunta?.respuesta_numerica?.maximo ?? 10,
    precision: pregunta?.respuesta_numerica?.precision ?? 2,
  });

  // Estado FIB con items[]
  const [items, setItems] = useState<IItemFIBEditor[]>(() =>
    pregunta && esFIB ? getItemsEditor(pregunta) : [],
  );
  const [columnas, setColumnas] = useState<1 | 2 | 3>(() =>
    normalizeColumnas(pregunta?.columnas),
  );
  const [dropdownBlancos, setDropdownBlancos] = useState<
    IDropdownBlancoEditorForm[]
  >(() => {
    if (pregunta?.tipo !== "multiple_dropdowns" || !pregunta.opciones?.length) {
      return [
        {
          blank_id: "blanco1",
          opciones: [
            { texto: "", es_correcta: true },
            { texto: "", es_correcta: false },
          ],
        },
      ];
    }
    const ids = [
      ...new Set(pregunta.opciones.map((op) => op.blank_id ?? "blanco1")),
    ];
    return ids.map((bid) => ({
      blank_id: bid,
      opciones: pregunta.opciones
        .filter((op) => op.blank_id === bid)
        .map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
    }));
  });

  // Canvas status
  const tieneErrores =
    ejercicio.canvas_deployments?.some(
      (d) => d.status === "error" || d.status === "missing",
    ) ?? false;
  const tienePending =
    ejercicio.canvas_deployments?.some((d) => d.status === "pending") ?? false;
  const syncCount =
    ejercicio.canvas_deployments?.filter((d) => d.status === "synced").length ??
    0;

  const tipoPregunta = pregunta?.tipo ?? "";
  const tipoColor = TIPO_COLOR[tipoPregunta] ?? "#2563EB";

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAbrirEdicion = () => {
    setMenuAnchor(null);
    if (!pregunta) return;
    setEnunciado(
      esFIB
        ? pregunta.enunciado_contexto || pregunta.enunciado || ""
        : (pregunta.enunciado ?? ""),
    );
    setPuntos(pregunta.puntos ?? 1);
    setOpciones(
      (pregunta.opciones ?? []).map((op) => ({
        texto: op.texto,
        es_correcta: op.es_correcta,
        blank_id: op.blank_id ?? null,
      })),
    );
    setPares(
      (pregunta.pares ?? []).map((p) => ({
        izquierda: p.izquierda,
        derecha: p.derecha,
      })),
    );
    setRespNum({
      tipo: pregunta.respuesta_numerica?.tipo ?? "exact",
      exacto: pregunta.respuesta_numerica?.exacto ?? 0,
      margen: pregunta.respuesta_numerica?.margen ?? 0,
      minimo: pregunta.respuesta_numerica?.minimo ?? 0,
      maximo: pregunta.respuesta_numerica?.maximo ?? 10,
      precision: pregunta.respuesta_numerica?.precision ?? 2,
    });
    setItems(esFIB ? getItemsEditor(pregunta) : []);
    setColumnas(normalizeColumnas(pregunta.columnas));
    if (pregunta.tipo === "multiple_dropdowns" && pregunta.opciones?.length) {
      const ids = [
        ...new Set(pregunta.opciones.map((op) => op.blank_id ?? "blanco1")),
      ];
      setDropdownBlancos(
        ids.map((bid) => ({
          blank_id: bid,
          opciones: pregunta.opciones
            .filter((op) => op.blank_id === bid)
            .map((op) => ({ texto: op.texto, es_correcta: op.es_correcta })),
        })),
      );
    } else {
      setDropdownBlancos([
        {
          blank_id: "blanco1",
          opciones: [
            { texto: "", es_correcta: true },
            { texto: "", es_correcta: false },
          ],
        },
      ]);
    }
    setEditando(true);
  };

  const handleGuardar = async () => {
    if (!pregunta) return;
    setGuardando(true);

    const payload: Parameters<typeof editarPregunta>[0] = {
      pregunta_id: pregunta._id,
      enunciado: cleanForDB(enunciado), // ← limpiar
      puntos,
    };

    switch (pregunta.tipo) {
      case "multiple_choice":
      case "multiple_answers":
      case "true_false":
        payload.opciones = opciones.map((op) => ({
          ...op,
          texto: cleanForDB(op.texto), // ← limpiar cada alternativa
        }));
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = respNum;
        break;
      case "fill_in_multiple_blanks":
        payload.enunciado_contexto = cleanForDB(enunciado);
        payload.columnas = columnas;
        payload.tipo_pimu = items[0]?.tipoPimu ?? "numero";
        payload.items = items.map((it) => ({
          id: it.id,
          enunciado: it.enunciado.trim(),
          respuesta: it.respuesta.trim(),
          tipo_pimu: it.tipoPimu,
        }));
        payload.opciones = items.map((it) => ({
          texto: it.respuesta.trim(),
          es_correcta: true,
          blank_id: it.id,
          tipo_pimu: it.tipoPimu,
        }));
        break;
      case "multiple_dropdowns":
        payload.opciones = dropdownBlancos.flatMap((b) =>
          b.opciones
            .filter((o: { texto: string; es_correcta: boolean }) =>
              o.texto.trim(),
            )
            .map((o: { texto: string; es_correcta: boolean }) => ({
              texto: cleanForDB(o.texto.trim()), // ← limpiar
              es_correcta: o.es_correcta,
              blank_id: b.blank_id,
            })),
        );
        break;
    }

    await dispatch(editarPregunta(payload));
    setGuardando(false);
    setEditando(false);
  };

  const handleToggleCanvas = async () => {
    setTogglingCanvas(true);
    await dispatch(
      editarQuiz({
        quiz_id: ejercicio._id,
        published_canvas: !ejercicio.published_canvas,
      }),
    );
    setTogglingCanvas(false);
  };

  const handleToggleApi = async () => {
    setTogglingApi(true);
    await dispatch(
      editarQuiz({
        quiz_id: ejercicio._id,
        published_api: !ejercicio.published_api,
      }),
    );
    setTogglingApi(false);
  };

  const handleReintentar = (canvas_curso_id: number) =>
    dispatch(
      reintentarEjercicio({ ejercicio_id: ejercicio._id, canvas_curso_id }),
    );

  // ── Render ────────────────────────────────────────────────────────────────

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
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          {/* ── Header ── */}
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

            {/* Ícono circular */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0,
                background: "#EA580C18",
                border: "0.5px solid #EA580C40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditNoteIcon sx={{ fontSize: 20, color: "#EA580C" }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "gray",
                  fontSize: "14px",
                  lineHeight: 1.3,
                  mb: 0.6,
                }}
              >
                Ejercicio
              </Typography>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 200,
                    color: "#0F172A",
                    fontSize: "13px",
                    lineHeight: 1.3,
                  }}
                >
                  Pregunta {index + 1}
                </Typography>
                {tipoPregunta && (
                  <Chip
                    label={TIPO_LABEL[tipoPregunta] ?? tipoPregunta}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      height: 18,
                      bgcolor: `${tipoColor}18`,
                      color: tipoColor,
                      fontWeight: 600,
                    }}
                  />
                )}
                {syncCount > 0 && !tieneErrores && (
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
                    Error Canvas
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
                  title={`Canvas: ${ejercicio.published_canvas ? "publicado" : "oculto"}`}
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
                          ejercicio.published_canvas
                            ? iconBtnActiveSx
                            : iconBtnSx
                        }
                      >
                        <SchoolIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </span>
                </Tooltip>
                <Tooltip
                  title={`Plataforma: ${ejercicio.published_api ? "publicado" : "oculto"}`}
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
                        sx={
                          ejercicio.published_api ? iconBtnActiveSx : iconBtnSx
                        }
                      >
                        {ejercicio.published_api ? (
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
                    onClick={handleAbrirEdicion}
                    sx={{ gap: 1.5, py: 1, "&:hover": { bgcolor: "#F8FAFC" } }}
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
                    onClick={() => {
                      setMenuAnchor(null);
                      setModalEliminar(true);
                    }}
                    sx={{ gap: 1.5, py: 1, "&:hover": { bgcolor: "#FFF5F5" } }}
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

            {/* Botones Guardar/Cancelar al editar */}
            {editando && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Tooltip title="Guardar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleGuardar}
                      disabled={guardando}
                      sx={{ color: "#2563EB" }}
                    >
                      {guardando ? (
                        <CircularProgress size={14} sx={{ color: "#2563EB" }} />
                      ) : (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Cancelar">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(false)}
                    sx={{ color: "#94A3B8" }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>

          {/* ── Contenido ── */}
          {pregunta ? (
            <div
              style={{
                borderTop: "0.5px solid #F1F5F9",
                padding: "14px 16px",
                background: "#FAFAFA",
              }}
            >
              {editando ? (
                <PreguntaEditor
                  tipo={pregunta.tipo as TipoPreguntaEditor}
                  enunciado={normalizeForEditor(enunciado)}
                  onEnunciadoChange={setEnunciado}
                  puntos={puntos}
                  onPuntosChange={setPuntos}
                  opciones={opciones}
                  onOpcionesChange={setOpciones}
                  pares={pares}
                  onParesChange={setPares}
                  respNum={respNum}
                  onRespNumChange={setRespNum}
                  items={items}
                  columnas={columnas}
                  onItemsChange={(nextItems, nextColumnas) => {
                    setItems(nextItems);
                    setColumnas(nextColumnas);
                  }}
                  dropdownBlancos={dropdownBlancos}
                  onDropdownBlancosChange={setDropdownBlancos}
                />
              ) : (
                <PreguntaViewer
                  tipo={pregunta.tipo as TipoPreguntaEditor}
                  enunciado={pregunta.enunciado}
                  enunciado_contexto={
                    pregunta.enunciado_contexto || pregunta.enunciado
                  }
                  items={esFIB ? getItemsViewer(pregunta) : undefined}
                  columnas={normalizeColumnas(pregunta.columnas)}
                  opciones={pregunta.opciones}
                  pares={pregunta.pares}
                  respuesta_numerica={pregunta.respuesta_numerica}
                  tipo_pimu={pregunta.tipo_pimu}
                  respuesta_lti={pregunta.respuesta_lti}
                />
              )}
            </div>
          ) : (
            // Sin pregunta → mostrar FormPregunta directamente
            <div
              style={{
                borderTop: "0.5px solid #F1F5F9",
                padding: "14px 16px",
                background: "#FAFAFA",
              }}
            >
              <FormPregunta
                quiz_id={ejercicio._id}
                onCreada={() =>
                  dispatch(obtenerPreguntas({ quiz_id: ejercicio._id }))
                }
              />
            </div>
          )}

          {/* ── Footer de errores Canvas ── */}
          {tieneErrores && !editando && (
            <div
              style={{
                borderTop: "1px solid #E2E8F0",
                padding: "8px 14px",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {ejercicio.canvas_deployments
                ?.filter((d) => d.status === "error" || d.status === "missing")
                .map((d) => (
                  <div
                    key={d.canvas_curso_id}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
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
                      Canvas {d.canvas_curso_id}
                    </span>
                    <Tooltip title="Reintentar">
                      <IconButton
                        size="small"
                        onClick={() => handleReintentar(d.canvas_curso_id)}
                        sx={{
                          color: "#94A3B8",
                          "&:hover": { color: "#2563EB" },
                        }}
                      >
                        <RefreshIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminar
          ejercicio={ejercicio}
          onClose={() => setModalEliminar(false)}
        />
      )}
    </>
  );
};

export default EjercicioCard;