// src/pages/plataforma/ClasePlataforma.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, CircularProgress, Button, Chip, Accordion,
  AccordionSummary, AccordionDetails, Divider,
} from "@mui/material";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon      from "@mui/icons-material/ExpandMore";
import SlideshowIcon       from "@mui/icons-material/Slideshow";
import VideoLibraryIcon    from "@mui/icons-material/VideoLibrary";
import QuizIcon            from "@mui/icons-material/Quiz";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { obtenerClasePlataforma }         from "../../store/slices/plataforma";
import { calcularIndicador }              from "../../helpers/indicadorIntento";
import { chapter } from "../../db/db";

const ClasePlataforma = () => {
  const { curso_id, capitulo_id, clase_id } = useParams<{
    curso_id: string; capitulo_id: string; clase_id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { temas, isLoading } = useAppSelector((s) => s.plataforma);

  useEffect(() => {
    if (clase_id) dispatch(obtenerClasePlataforma({ clase_id }));
  }, [clase_id, dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">
        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}`)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Volver al {chapter.name}
        </Button>

        {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}

        <div className="flex flex-col gap-3">
          {temas.map((tema) => (
            <Accordion key={tema._id} defaultExpanded elevation={0}
              sx={{ borderRadius: "12px !important", border: "1px solid #d9e4ee",
                opacity: tema.published_api ? 1 : 0.45,
                "&:before": { display: "none" }, mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#8daecb" }} />}
                sx={{ px: 3, py: 1 }}>
                <div>
                  <Typography variant="caption" sx={{ color: "#8daecb" }}>Tema {tema.position}</Typography>
                  <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>{tema.nombre}</Typography>
                </div>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                <Divider sx={{ mb: 2, borderColor: "#f0f0f0" }} />
                <div className="flex flex-col gap-3">

                  {/* Diapositivas */}
                  {tema.diapositivas.map((diapo) => (
                    <div key={diapo._id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "#fff3ed", opacity: diapo.published_api ? 1 : 0.45 }}>
                      <SlideshowIcon sx={{ color: "#f47c3c", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ flex: 1, color: "#1f2c38", fontWeight: 500 }}>
                        {diapo.titulo}
                      </Typography>
                      {diapo.url && (
                        <Button size="small" href={diapo.url} target="_blank"
                          sx={{ color: "#f47c3c", fontWeight: 600, fontSize: "0.75rem" }}>
                          Abrir
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Videos */}
                  {tema.videos.map((video) => (
                    <div key={video._id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "#fff0f0", opacity: video.published_api ? 1 : 0.45 }}>
                      <VideoLibraryIcon sx={{ color: "#e03030", fontSize: 20 }} />
                      <Typography variant="body2" sx={{ flex: 1, color: "#1f2c38", fontWeight: 500 }}>
                        {video.titulo}
                      </Typography>
                      {video.url && (
                        <Button size="small" href={video.url} target="_blank"
                          sx={{ color: "#e03030", fontWeight: 600, fontSize: "0.75rem" }}>
                          Ver
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Quizzes */}
                  {tema.quizzes.map((quiz) => {
                    const ind = calcularIndicador(quiz.ultimo_intento, quiz.intentos, quiz.umbral_aprobacion);
                    return (
                      <div key={quiz._id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: "#f0f3ff", opacity: quiz.published_api ? 1 : 0.45 }}>
                        <span style={{ fontSize: 18 }}>{ind.icono || <QuizIcon sx={{ color: "#2d5be3", fontSize: 20 }} />}</span>
                        <Typography variant="body2" sx={{ flex: 1, color: "#1f2c38", fontWeight: 500 }}>
                          {quiz.titulo}
                        </Typography>
                        {ind.estado !== "sin_intentos" && (
                          <Chip label={ind.label} size="small"
                            sx={{ fontSize: "0.6rem", bgcolor: `${ind.color}20`, color: ind.color, fontWeight: 600 }} />
                        )}
                        <Button size="small" disabled={ind.estado === "agotado"}
                          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/clases/${clase_id}/quiz/${quiz._id}`)}
                          sx={{ color: "#2d5be3", fontWeight: 600, fontSize: "0.75rem" }}>
                          {ind.estado === "agotado" ? "Agotado" : ind.estado === "sin_intentos" ? "Iniciar" : "Reintentar"}
                        </Button>
                      </div>
                    );
                  })}

                  {tema.diapositivas.length === 0 && tema.videos.length === 0 && tema.quizzes.length === 0 && (
                    <Typography variant="body2" sx={{ color: "#8daecb", fontStyle: "italic" }}>
                      Sin recursos disponibles
                    </Typography>
                  )}
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClasePlataforma;