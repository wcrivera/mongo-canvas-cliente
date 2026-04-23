import { useState }        from "react";
import {
  Card, CardContent, Typography,
  IconButton, Tooltip, TextField,
  Button, CircularProgress,
  Switch, Divider,
} from "@mui/material";
import KeyboardArrowUpIcon   from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon      from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutlineOutlined";
import CheckIcon             from "@mui/icons-material/Check";
import DescriptionIcon       from "@mui/icons-material/Description";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import QuizIcon              from "@mui/icons-material/Quiz";
import { useNavigate }       from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarAyudantia,
  eliminarAyudantia,
  cambiarPositionAyudantia,
} from "../../store/slices/ayudantia";
import { crearRecurso }      from "../../store/slices/recurso";
import type { IAyudantia }   from "../../store/slices/ayudantia";
import type { IRecurso }     from "../../store/slices/recurso";
import ModalSolucionTexto    from "./ModalSolucionTexto";
import ModalUrlVideo         from "../clases/ModalUrlVideo";
import ModalCrearQuiz        from "../clases/ModalCrearQuiz";
import type { IQuiz }        from "../../store/slices/quiz";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  ayudantia:   IAyudantia;
  curso_id:    string;
  capitulo_id: string;
  esPrimero:   boolean;
  esUltimo:    boolean;
}

const AyudantiaCard = ({
  ayudantia, curso_id, capitulo_id, esPrimero, esUltimo,
}: Props) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { soluciones } = useAppSelector((s) => s.solucionTextoMongo);
  const { recursos }   = useAppSelector((s) => s.recursoMongo);
  const { videos }     = useAppSelector((s) => s.videoMongo);
  const { quizzes }    = useAppSelector((s) => s.quizMongo);

  // Recursos asociados a esta ayudantía
  const recursosAyudantia = recursos.filter(
    r => r.ayudantia_id === ayudantia._id
  );
  const recursoVideo = recursosAyudantia.find(r => r.tipo === 'video');
  const recursoQuiz  = recursosAyudantia.find(r => r.tipo === 'quiz');

  const solucion = soluciones.find(s => s.ayudantia_id === ayudantia._id);
  const video    = videos.find(v => recursoVideo && v.recurso_id === recursoVideo._id);
  const quiz     = quizzes.find(q => recursoQuiz && q.recurso_id === recursoQuiz._id);

  const [editando, setEditando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [previewEnunciado, setPreviewEnunciado] = useState(false);
  const [form, setForm] = useState({
    nombre:    ayudantia.nombre,
    enunciado: ayudantia.enunciado,
    published: ayudantia.published,
  });

  // Modales
  const [modalSolucion, setModalSolucion] = useState(false);
  const [modalVideo, setModalVideo]       = useState<{
    abierto: boolean; recurso_id: string;
  }>({ abierto: false, recurso_id: "" });
  const [modalQuiz, setModalQuiz]         = useState<{
    abierto: boolean; recurso_id: string;
  }>({ abierto: false, recurso_id: "" });

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarAyudantia({ ayudantia_id: ayudantia._id, ...form }));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${ayudantia.nombre}"?`)) return;
    setEliminando(true);
    await dispatch(eliminarAyudantia({ ayudantia_id: ayudantia._id }));
    setEliminando(false);
  };

  const handleMoverArriba = () =>
    dispatch(cambiarPositionAyudantia({
      ayudantia_id: ayudantia._id, direction: 'up',
    }));

  const handleMoverAbajo = () =>
    dispatch(cambiarPositionAyudantia({
      ayudantia_id: ayudantia._id, direction: 'down',
    }));

  const handleCrearVideo = async () => {
    if (recursoVideo) {
      setModalVideo({ abierto: true, recurso_id: recursoVideo._id });
      return;
    }
    const resultado = await dispatch(crearRecurso({
      contexto:     'ayudantia',
      ayudantia_id: ayudantia._id,
      tipo:         'video',
      titulo:       `Video · ${ayudantia.nombre}`,
    })) as unknown as { ok: boolean; data?: IRecurso };

    if (resultado.ok && resultado.data) {
      setModalVideo({ abierto: true, recurso_id: resultado.data._id });
    }
  };

  const handleCrearQuiz = async () => {
    if (recursoQuiz && quiz) {
      navigate(
        `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${recursoQuiz._id}`
      );
      return;
    }
    const resultado = await dispatch(crearRecurso({
      contexto:     'ayudantia',
      ayudantia_id: ayudantia._id,
      tipo:         'quiz',
      titulo:       `Quiz · ${ayudantia.nombre}`,
    })) as unknown as { ok: boolean; data?: IRecurso };

    if (resultado.ok && resultado.data) {
      setModalQuiz({ abierto: true, recurso_id: resultado.data._id });
    }
  };

  const handleQuizCreado = (quizCreado: IQuiz) => {
    setModalQuiz({ abierto: false, recurso_id: "" });
    navigate(
      `/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia._id}/quiz/${quizCreado.recurso_id}`
    );
  };

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
          <div className="flex items-center gap-4 px-5 py-4">
            <div style={{
              width: 48, height: 48,
              borderRadius: "50%",
              background: "white",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 22,
            }}>
              👥
            </div>

            <div className="flex-1 min-w-0">
              <Typography
                variant="caption"
                sx={{
                  color: "#a0a0a0",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Ayudantía {ayudantia.position}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#3d3d3d", fontWeight: 500, mt: 0.3 }}
                noWrap
              >
                {ayudantia.nombre}
              </Typography>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <Tooltip title={ayudantia.published ? "Publicada" : "No publicada"}>
                <Switch
                  size="small"
                  checked={ayudantia.published}
                  disabled
                  sx={{
                    "& .MuiSwitch-thumb": {
                      bgcolor: ayudantia.published ? "#4A6D8C" : "#ccc",
                    },
                  }}
                />
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => setEditando(true)}
                  sx={{ color: "#8daecb", "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" } }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleEliminar}
                    disabled={eliminando}
                    sx={{ color: "#8daecb", "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" } }}
                  >
                    {eliminando
                      ? <CircularProgress size={14} />
                      : <DeleteOutlineIcon fontSize="small" />
                    }
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Subir">
                <span>
                  <IconButton
                    size="small"
                    disabled={esPrimero}
                    onClick={handleMoverArriba}
                    sx={{
                      color: "#8daecb",
                      "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                      "&:disabled": { color: "#d9e4ee" },
                    }}
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Bajar">
                <span>
                  <IconButton
                    size="small"
                    disabled={esUltimo}
                    onClick={handleMoverAbajo}
                    sx={{
                      color: "#8daecb",
                      "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                      "&:disabled": { color: "#d9e4ee" },
                    }}
                  >
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </div>

          <Divider sx={{ borderColor: "#f0f0f0" }} />

          {/* ── Enunciado ── */}
          <div className="px-5 py-4">
            {editando ? (
              <div className="flex flex-col gap-3">
                <TextField
                  label="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                  size="small"
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />

                <div className="flex gap-2">
                  {["Editar", "Preview"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setPreviewEnunciado(tab === "Preview")}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        border: "1px solid #d9e4ee",
                        background: (tab === "Preview") === previewEnunciado
                          ? "#4A6D8C" : "white",
                        color: (tab === "Preview") === previewEnunciado
                          ? "white" : "#4A6D8C",
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {!previewEnunciado ? (
                  <textarea
                    value={form.enunciado}
                    onChange={(e) => setForm(f => ({ ...f, enunciado: e.target.value }))}
                    placeholder="Enunciado con LaTeX..."
                    style={{
                      width: "100%",
                      minHeight: 120,
                      padding: "10px",
                      borderRadius: 8,
                      border: "1px solid #d9e4ee",
                      fontSize: 13,
                      fontFamily: "monospace",
                      resize: "vertical",
                      outline: "none",
                    }}
                  />
                ) : (
                  <div style={{
                    minHeight: 80,
                    padding: "12px",
                    borderRadius: 8,
                    border: "1px solid #d9e4ee",
                    fontSize: 14,
                    lineHeight: 1.8,
                    background: "#fafafa",
                  }}>
                    <LatexRenderer>{form.enunciado}</LatexRenderer>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
                    checked={form.published}
                    onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
                    sx={{ "& .MuiSwitch-thumb": { bgcolor: form.published ? "#4A6D8C" : "#ccc" } }}
                  />
                  <Typography variant="caption" sx={{ color: "#6793ba" }}>
                    {form.published ? "Publicada" : "No publicada"}
                  </Typography>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setEditando(false);
                      setForm({
                        nombre:    ayudantia.nombre,
                        enunciado: ayudantia.enunciado,
                        published: ayudantia.published,
                      });
                    }}
                    sx={{ color: "#6793ba", borderRadius: 2 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={guardando}
                    startIcon={
                      guardando
                        ? <CircularProgress size={12} color="inherit" />
                        : <CheckIcon />
                    }
                    sx={{
                      bgcolor: "#4A6D8C",
                      borderRadius: 2,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
                    }}
                  >
                    {guardando ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 14, lineHeight: 1.8, color: "#3d3d3d" }}>
                {ayudantia.enunciado
                  ? <LatexRenderer>{ayudantia.enunciado}</LatexRenderer>
                  : <span style={{ color: "#8daecb", fontStyle: "italic" }}>
                      Sin enunciado
                    </span>
                }
              </div>
            )}
          </div>

          <Divider sx={{ borderColor: "#f0f0f0" }} />

          {/* ── Recursos ── */}
          <div className="px-5 py-3 flex items-center gap-4 flex-wrap">

            {/* Solución texto */}
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30,
                borderRadius: 6,
                background: solucion ? "#4A6D8C" : "#f0f4f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <DescriptionIcon sx={{ fontSize: 16, color: solucion ? "white" : "#8daecb" }} />
              </div>
              <Button
                size="small"
                onClick={() => setModalSolucion(true)}
                sx={{
                  fontSize: "0.7rem",
                  color: solucion ? "#4A6D8C" : "#8daecb",
                  p: "2px 6px",
                  "&:hover": { bgcolor: "#f0f4f8" },
                }}
              >
                {solucion ? "Editar solución" : "+ Solución"}
              </Button>
            </div>

            {/* Video */}
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30,
                borderRadius: 6,
                background: video ? "#e03030" : "#f0f4f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <PlayCircleOutlineIcon
                  sx={{ fontSize: 16, color: video ? "white" : "#8daecb" }}
                />
              </div>
              <Button
                size="small"
                onClick={handleCrearVideo}
                sx={{
                  fontSize: "0.7rem",
                  color: video ? "#e03030" : "#8daecb",
                  p: "2px 6px",
                  "&:hover": { bgcolor: "#f0f4f8" },
                }}
              >
                {video ? "Editar video" : "+ Video"}
              </Button>
            </div>

            {/* Quiz */}
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30,
                borderRadius: 6,
                background: quiz ? "#2d5be3" : "#f0f4f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <QuizIcon sx={{ fontSize: 16, color: quiz ? "white" : "#8daecb" }} />
              </div>
              <Button
                size="small"
                onClick={handleCrearQuiz}
                sx={{
                  fontSize: "0.7rem",
                  color: quiz ? "#2d5be3" : "#8daecb",
                  p: "2px 6px",
                  "&:hover": { bgcolor: "#f0f4f8" },
                }}
              >
                {quiz ? "Editar preguntas" : "+ Quiz"}
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {modalSolucion && (
        <ModalSolucionTexto
          ayudantia_id={ayudantia._id}
          solucion={solucion}
          onClose={() => setModalSolucion(false)}
        />
      )}

      {modalVideo.abierto && (
        <ModalUrlVideo
          recurso_id={modalVideo.recurso_id}
          video={video}
          onClose={() => setModalVideo({ abierto: false, recurso_id: "" })}
        />
      )}

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

export default AyudantiaCard;