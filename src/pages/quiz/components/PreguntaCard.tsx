// src/pages/quiz/components/PreguntaCard.tsx
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import { useAppDispatch } from "../../../store/hooks";
import {
  editarPregunta,
  cambiarPositionPregunta,
} from "../../../store/slices/quiz";
import type { IPregunta } from "../../../store/slices/quiz/quizSlice";

import PreguntaEditor, {
  type IOpcionEditor,
  type IParEditor,
  type IRespuestaNumEditor,
  type IItemFIBEditor,
  type IDropdownBlancoEditorForm,
  type TipoPreguntaEditor,
  type TipoPimu,
} from "../../../components/quiz/PreguntaEditor";
import PreguntaViewer, {
  type TipoPreguntaViewer,
  type IItemFIBViewer,
} from "../../../components/quiz/PreguntaViewer";
import ModalEliminar from "../ModalEliminar";
import { normalizeForEditor } from "../../../components/CKEditor/mathUtils";

// ── Labels y colores por tipo ─────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  multiple_choice: "Opción múltiple",
  multiple_answers: "Múltiple respuesta",
  true_false: "Verdadero/Falso",
  short_answer: "Respuesta corta",
  essay: "Desarrollo",
  matching: "Coincidencia",
  numerical: "Numérica",
  calculated: "Calculada",
  fill_in_multiple_blanks: "Completar (LTI)",
  multiple_dropdowns: "Listas desplegables",
  text_only_question: "Solo texto",
};

const TIPO_COLOR: Record<string, string> = {
  multiple_choice: "#2d5be3",
  multiple_answers: "#7c3aed",
  true_false: "#0891b2",
  short_answer: "#64748b",
  essay: "#64748b",
  matching: "#0d9488",
  numerical: "#ea580c",
  calculated: "#dc2626",
  fill_in_multiple_blanks: "#4A6D8C",
  multiple_dropdowns: "#0d9488",
  text_only_question: "#94a3b8",
};

// ── Helper: unificar ambos schemas FIB a items[] ──────────────────────────────

const getItemsEditor = (pregunta: IPregunta): IItemFIBEditor[] => {
  // Nuevo schema: items[] directamente
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
  return pregunta.opciones
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
  return pregunta.opciones
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

const normalizeColumnas = (c: number | undefined): 1 | 2 | 3 =>
  Math.max(1, Math.min(3, Number(c) || 1)) as 1 | 2 | 3;

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  pregunta: IPregunta;
  esPrimero: boolean;
  esUltimo: boolean;
}

// ── Componente ────────────────────────────────────────────────────────────────

const PreguntaCard = ({ pregunta, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const esFIB = pregunta.tipo === "fill_in_multiple_blanks";

  // ── Estado del editor ─────────────────────────────────────────────────────
  const [enunciado, setEnunciado] = useState(
    esFIB
      ? pregunta.enunciado_contexto || pregunta.enunciado
      : pregunta.enunciado,
  );

  const enunciadoPregunta = esFIB
    ? pregunta?.enunciado_contexto || pregunta?.enunciado || ""
    : (pregunta?.enunciado ?? "");
  const [puntos, setPuntos] = useState(pregunta.puntos);

  const [opciones, setOpciones] = useState<IOpcionEditor[]>(
    pregunta.opciones.map((op) => ({
      texto: op.texto,
      es_correcta: op.es_correcta,
      blank_id: op.blank_id ?? null,
    })),
  );

  const opcionesPregunta = (pregunta?.opciones ?? []).map((op) => ({
    texto: normalizeForEditor(op.texto),
    es_correcta: op.es_correcta,
    blank_id: op.blank_id ?? null,
  }));
  
  const [pares, setPares] = useState<IParEditor[]>(
    (pregunta.pares ?? []).map((p) => ({
      izquierda: p.izquierda,
      derecha: p.derecha,
    })),
  );
  const [respNum, setRespNum] = useState<IRespuestaNumEditor>({
    tipo: pregunta.respuesta_numerica?.tipo ?? "exact",
    exacto: pregunta.respuesta_numerica?.exacto ?? 0,
    margen: pregunta.respuesta_numerica?.margen ?? 0,
    minimo: pregunta.respuesta_numerica?.minimo ?? 0,
    maximo: pregunta.respuesta_numerica?.maximo ?? 10,
    precision: pregunta.respuesta_numerica?.precision ?? 2,
  });
  const [items, setItems] = useState<IItemFIBEditor[]>(() =>
    esFIB ? getItemsEditor(pregunta) : [],
  );
  const [columnas, setColumnas] = useState<1 | 2 | 3>(() =>
    normalizeColumnas(pregunta.columnas),
  );
  const [dropdownBlancos, setDropdownBlancos] = useState<
    IDropdownBlancoEditorForm[]
  >(() => {
    if (
      pregunta.tipo !== "multiple_dropdowns" ||
      pregunta.opciones.length === 0
    ) {
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

  // ── Abrir edición ─────────────────────────────────────────────────────────
  const handleAbrirEdicion = () => {
    setEnunciado(
      esFIB
        ? pregunta.enunciado_contexto || pregunta.enunciado
        : pregunta.enunciado,
    );
    setPuntos(pregunta.puntos);
    setOpciones(
      pregunta.opciones.map((op) => ({
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
    if (
      pregunta.tipo === "multiple_dropdowns" &&
      pregunta.opciones.length > 0
    ) {
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

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true);
    const payload: Parameters<typeof editarPregunta>[0] = {
      pregunta_id: pregunta._id,
      enunciado,
      puntos,
    };

    switch (pregunta.tipo) {
      case "multiple_choice":
      case "multiple_answers":
      case "true_false":
        payload.opciones = opciones;
        break;
      case "matching":
        payload.pares = pares;
        break;
      case "numerical":
        payload.respuesta_numerica = respNum;
        break;
      case "fill_in_multiple_blanks":
        payload.enunciado_contexto = enunciado;
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
            .filter((o) => o.texto.trim())
            .map((o) => ({
              texto: o.texto.trim(),
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

  // ── Mover ─────────────────────────────────────────────────────────────────
  const handleMover = async (direction: "up" | "down") => {
    if (moviendo) return;
    setMoviendo(true);
    await dispatch(
      cambiarPositionPregunta({ pregunta_id: pregunta._id, direction }),
    );
    setMoviendo(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Card
        elevation={0}
        className="animate-fadeIn"
        sx={{
          borderRadius: 3,
          border: "1px solid #d9e4ee",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* ── Header ── */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{
              background: "linear-gradient(135deg, #f0f4f8 0%, #ffffff 100%)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#4A6D8C",
                color: "white",
                fontSize: 12,
                fontWeight: 500,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pregunta.position}
            </div>

            <div className="flex items-center gap-2 flex-1 flex-wrap">
              <Chip
                label={TIPO_LABEL[pregunta.tipo] ?? pregunta.tipo}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  fontWeight: 600,
                  bgcolor: `${TIPO_COLOR[pregunta.tipo] ?? "#64748b"}20`,
                  color: TIPO_COLOR[pregunta.tipo] ?? "#64748b",
                }}
              />
              <Typography variant="caption" sx={{ color: "#8daecb" }}>
                {pregunta.puntos} pt{pregunta.puntos !== 1 ? "s" : ""}
              </Typography>
              {esFIB && (
                <Chip
                  label={`${getItemsEditor(pregunta).length} blancos · ${normalizeColumnas(pregunta.columnas)} col`}
                  size="small"
                  sx={{
                    fontSize: "0.6rem",
                    height: 18,
                    bgcolor: "#f0fdf4",
                    color: "#16a34a",
                  }}
                />
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {editando ? (
                <>
                  <Tooltip title="Guardar">
                    <IconButton
                      size="small"
                      onClick={handleGuardar}
                      disabled={guardando}
                      sx={{ color: "#16a34a", "&:hover": { color: "#15803d" } }}
                    >
                      {guardando ? (
                        <CircularProgress size={14} sx={{ color: "#16a34a" }} />
                      ) : (
                        <CheckIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton
                      size="small"
                      onClick={() => setEditando(false)}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Mover arriba">
                    <span>
                      <IconButton
                        size="small"
                        disabled={esPrimero || moviendo}
                        onClick={() => handleMover("up")}
                        sx={{
                          color: "#8daecb",
                          "&:hover": { color: "#4A6D8C" },
                          "&:disabled": { color: "#d9e4ee" },
                        }}
                      >
                        {moviendo ? (
                          <CircularProgress
                            size={14}
                            sx={{ color: "#8daecb" }}
                          />
                        ) : (
                          <KeyboardArrowUpIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Mover abajo">
                    <span>
                      <IconButton
                        size="small"
                        disabled={esUltimo || moviendo}
                        onClick={() => handleMover("down")}
                        sx={{
                          color: "#8daecb",
                          "&:hover": { color: "#4A6D8C" },
                          "&:disabled": { color: "#d9e4ee" },
                        }}
                      >
                        <KeyboardArrowDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={handleAbrirEdicion}
                      sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C" } }}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      onClick={() => setModalEliminar(true)}
                      sx={{ color: "#8daecb", "&:hover": { color: "#ef4444" } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </div>

          {/* ── Cuerpo ── */}
          <div className="px-5 py-4">
            {editando ? (
              <PreguntaEditor
                tipo={pregunta.tipo as TipoPreguntaEditor}
                enunciado={normalizeForEditor(enunciadoPregunta)}
                onEnunciadoChange={setEnunciado}
                puntos={puntos}
                onPuntosChange={setPuntos}
                opciones={opcionesPregunta}
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
                tipo={pregunta.tipo as TipoPreguntaViewer}
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
        </CardContent>
      </Card>

      {modalEliminar && (
        <ModalEliminar
          pregunta={pregunta}
          onClose={() => setModalEliminar(false)}
        />
      )}
    </>
  );
};

export default PreguntaCard;
