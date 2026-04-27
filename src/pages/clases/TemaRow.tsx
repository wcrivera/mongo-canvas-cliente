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
import EditOutlinedIcon  from "@mui/icons-material/EditOutlined";
import CheckIcon         from "@mui/icons-material/Check";
import CloseIcon         from "@mui/icons-material/Close";
import AddIcon           from "@mui/icons-material/Add";
import { useNavigate }   from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { editarTema, eliminarTema }       from "../../store/slices/tema";
import { crearRecurso }                   from "../../store/slices/recurso";
import type { ITema }                     from "../../store/slices/tema";
import type { TipoRecurso, IRecurso }     from "../../store/slices/recurso";
import type { IQuiz }                     from "../../store/slices/quiz";
import RecursoItem             from "./RecursoItem";
import ModalElegirDiapositiva  from "./ModalElegirDiapositiva";
import ModalUrlDiapositiva     from "./ModalUrlDiapositiva";
import ModalUrlVideo           from "./ModalUrlVideo";
import ModalCrearQuiz          from "./ModalCrearQuiz";
import LatexRenderer           from "../../components/LaTeX/LatexRenderer";
import { crearDiapositiva }    from "../../store/slices/diapositiva";

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

  const [editando,  setEditando]  = useState(false);
  const [nombre,    setNombre]    = useState(tema.nombre);
  const [guardando, setGuardando] = useState(false);
  const [creando,   setCreando]   = useState(false);

  // Modales
  const [modalElegir, setModalElegir] = useState<{
    abierto:    boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const [modalUrl, setModalUrl] = useState<{
    abierto:    boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const [modalVideo, setModalVideo] = useState<{
    abierto:    boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const [modalQuiz, setModalQuiz] = useState<{
    abierto:    boolean;
    recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  // ── Handlers ────────────────────────────────────────────────────────────

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
        contexto: "clase",
        tema_id:  tema._id,
        tipo,
        titulo: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} · ${tema.nombre}`,
      }),
    )) as unknown as { ok: boolean; data?: IRecurso };

    setCreando(false);
    if (!resultado.ok || !resultado.data) return;

    if (tipo === "diapositiva") {
      // Siempre mostrar modal de elección al crear nueva
      setModalElegir({ abierto: true, recurso_id: resultado.data._id });
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

  // Al elegir "URL externa" desde el modal de elección
  const handleElegirUrl = () => {
    const recurso_id = modalElegir.recurso_id;
    setModalElegir({ abierto: false, recurso_id: "" });
    setModalUrl({ abierto: true, recurso_id });
  };

  // Al elegir "Crear con editor" desde el modal de elección
  const handleElegirEditor = async () => {
    const recurso_id = modalElegir.recurso_id;
    setModalElegir({ abierto: false, recurso_id: "" });

    const recurso = recursos.find((r) => r._id === recurso_id);
    if (!recurso) return;

    // Crear el objeto Diapositiva en BD con url vacía antes de ir al editor
    // Si ya existe (raro pero posible), agregarDiapositiva lo actualiza
    const resultado = await dispatch(
      crearDiapositiva({ recurso_id, url: "" }),
    ) as unknown as { ok: boolean };

    if (!resultado.ok) return; // error al crear, no navegar

    navigate(
      `/cursos/${recurso.curso_id}/capitulos/${recurso.capitulo_id}/clases/${recurso.clase_id}/diapositiva/${recurso_id}`,
    );
  };

  const tiposDisponibles: TipoRecurso[] = ["diapositiva", "video", "quiz"];
  const tiposExistentes  = recursosTema.map((r) => r.tipo);
  const tiposFaltantes   = tiposDisponibles.filter((t) => !tiposExistentes.includes(t));

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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
              <Tooltip title="Guardar">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleGuardar}
                    disabled={guardando}
                    sx={{ color: "#4A6D8C" }}
                  >
                    {guardando ? <CircularProgress size={14} /> : <CheckIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancelar">
                <IconButton
                  size="small"
                  onClick={() => { setEditando(false); setNombre(tema.nombre); }}
                  sx={{ color: "#6793ba" }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group">
              <Typography
                variant="body2"
                sx={{ color: "#374151", fontSize: 13, fontWeight: 500, flex: 1 }}
              >
                <LatexRenderer>{tema.nombre}</LatexRenderer>
              </Typography>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <Tooltip title="Editar nombre">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(true)}
                    sx={{ color: "#8daecb", p: 0.3, "&:hover": { color: "#4A6D8C" } }}
                  >
                    <EditOutlinedIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar tema">
                  <IconButton
                    size="small"
                    onClick={handleEliminar}
                    sx={{ color: "#8daecb", p: 0.3, "&:hover": { color: "#ef4444" } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Recursos existentes */}
        <div className="flex flex-col gap-1 mb-2">
          {recursosTema.map((r) => (
            <RecursoItem key={r._id} recurso={r} />
          ))}
        </div>

        {/* Botones agregar recurso */}
        <div className="flex gap-1 flex-wrap">
          {tiposFaltantes.map((tipo) => (
            <Tooltip key={tipo} title={`Agregar ${tipo}`}>
              <span>
                <Button
                  size="small"
                  disabled={creando}
                  onClick={() => handleCrearRecurso(tipo)}
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

      {/* ── Modal elegir tipo de diapositiva (primera vez) ── */}
      {modalElegir.abierto && (
        <ModalElegirDiapositiva
          onElegirUrl={handleElegirUrl}
          onElegirEditor={handleElegirEditor}
          onClose={() => setModalElegir({ abierto: false, recurso_id: "" })}
        />
      )}

      {/* ── Modal URL diapositiva ── */}
      {modalUrl.abierto && (
        <ModalUrlDiapositiva
          recurso_id={modalUrl.recurso_id}
          onClose={() => setModalUrl({ abierto: false, recurso_id: "" })}
        />
      )}

      {/* ── Modal video ── */}
      {modalVideo.abierto && (
        <ModalUrlVideo
          recurso_id={modalVideo.recurso_id}
          onClose={() => setModalVideo({ abierto: false, recurso_id: "" })}
        />
      )}

      {/* ── Modal quiz ── */}
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