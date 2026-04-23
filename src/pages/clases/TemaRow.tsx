// src/pages/clases/TemaRow.tsx
import { useState } from "react";
import {
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { editarTema, eliminarTema } from "../../store/slices/tema";
import { crearRecurso } from "../../store/slices/recurso";
import type { ITema } from "../../store/slices/tema";
import type { TipoRecurso, IRecurso } from "../../store/slices/recurso";
import type { IQuiz } from "../../store/slices/quiz";
import RecursoItem from "./RecursoItem";
import ModalUrlDiapositiva from "./ModalUrlDiapositiva";
import ModalUrlVideo from "./ModalUrlVideo";
import ModalCrearQuiz from "./ModalCrearQuiz";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  tema: ITema;
}

const TemaRow = ({ tema }: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { recursos } = useAppSelector((s) => s.recursoMongo);

  const recursosTema = recursos
    .filter((r) => r.tema_id === tema._id)
    .sort((a, b) => a.position - b.position);

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(tema.nombre);
  const [guardando, setGuardando] = useState(false);
  const [creando, setCreando] = useState(false);

  // Modales
  const [modalDiapositiva, setModalDiapositiva] = useState<{
    abierto: boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const [modalVideo, setModalVideo] = useState<{
    abierto: boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const [modalQuiz, setModalQuiz] = useState<{
    abierto: boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarTema({ tema_id: tema._id, nombre }));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar tema "${tema.nombre}"?`)) return;
    await dispatch(eliminarTema({ tema_id: tema._id }));
  };

  const handleCrearRecurso = async (tipo: TipoRecurso) => {
    setCreando(true);
    const resultado = (await dispatch(
      crearRecurso({
        contexto: "clase", // ← agregar
        tema_id: tema._id,
        tipo,
        titulo: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} · ${tema.nombre}`,
      }),
    )) as unknown as { ok: boolean; data?: IRecurso };

    setCreando(false);
    if (!resultado.ok || !resultado.data) return;

    if (tipo === "diapositiva") {
      setModalDiapositiva({ abierto: true, recurso_id: resultado.data._id });
    } else if (tipo === "video") {
      setModalVideo({ abierto: true, recurso_id: resultado.data._id });
    } else if (tipo === "quiz") {
      setModalQuiz({ abierto: true, recurso_id: resultado.data._id });
    }
  };

  const handleQuizCreado = (quiz: IQuiz) => {
    setModalQuiz({ abierto: false, recurso_id: "" });
    navigate(
      `/cursos/${quiz.curso_id}/capitulos/${quiz.capitulo_id}/clases/${quiz.clase_id}/quiz/${quiz.recurso_id}`,
    );
  };

  const tiposDisponibles: TipoRecurso[] = ["diapositiva", "video", "quiz"];
  const tiposExistentes = recursosTema.map((r) => r.tipo);
  const tiposFaltantes = tiposDisponibles.filter(
    (t) => !tiposExistentes.includes(t),
  );

  return (
    <>
      <div style={{ borderTop: "1px solid #e0e0e0" }} className="px-5 py-3">
        {/* Nombre del tema */}
        <div className="flex items-center gap-2 mb-3">
          {editando ? (
            <div className="flex items-center gap-2 flex-1">
              <TextField
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                size="small"
                autoFocus
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 },
                }}
              />
              <Tooltip title="Guardar">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleGuardar}
                    disabled={guardando}
                    sx={{ color: "#4A6D8C" }}
                  >
                    {guardando ? (
                      <CircularProgress size={14} />
                    ) : (
                      <CheckIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancelar">
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditando(false);
                    setNombre(tema.nombre);
                  }}
                  sx={{ color: "#8daecb" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group">
              <Typography
                variant="caption"
                sx={{ color: "#555", fontWeight: 500, flex: 1 }}
              >
                <LatexRenderer>{tema.nombre}</LatexRenderer>
              </Typography>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <Tooltip title="Editar tema">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(true)}
                    sx={{
                      color: "#8daecb",
                      p: 0.3,
                      "&:hover": { color: "#4A6D8C" },
                    }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar tema">
                  <IconButton
                    size="small"
                    onClick={handleEliminar}
                    sx={{
                      color: "#8daecb",
                      p: 0.3,
                      "&:hover": { color: "#ef4444" },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Recursos */}
        <div className="flex items-center gap-6 flex-wrap">
          {recursosTema.map((r) => (
            <RecursoItem key={r._id} recurso={r} />
          ))}

          {/* Botones agregar recursos faltantes */}
          {tiposFaltantes.map((tipo) => (
            <Tooltip key={tipo} title={`Agregar ${tipo}`}>
              <span>
                <Button
                  size="small"
                  onClick={() => handleCrearRecurso(tipo)}
                  disabled={creando}
                  sx={{
                    fontSize: "0.65rem",
                    color: "#8daecb",
                    minWidth: 0,
                    p: "2px 6px",
                    "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                  }}
                  startIcon={<AddIcon sx={{ fontSize: "12px !important" }} />}
                >
                  {tipo}
                </Button>
              </span>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Modal diapositiva */}
      {modalDiapositiva.abierto && (
        <ModalUrlDiapositiva
          recurso_id={modalDiapositiva.recurso_id}
          onClose={() =>
            setModalDiapositiva({ abierto: false, recurso_id: "" })
          }
        />
      )}

      {/* Modal video */}
      {modalVideo.abierto && (
        <ModalUrlVideo
          recurso_id={modalVideo.recurso_id}
          onClose={() => setModalVideo({ abierto: false, recurso_id: "" })}
        />
      )}

      {/* Modal quiz */}
      {modalQuiz.abierto && (
        <ModalCrearQuiz
          recurso_id={modalQuiz.recurso_id}
          onClose={() => setModalQuiz({ abierto: false, recurso_id: "" })}
          onCreado={handleQuizCreado}
        />
      )}
    </>
  );
};

export default TemaRow;
