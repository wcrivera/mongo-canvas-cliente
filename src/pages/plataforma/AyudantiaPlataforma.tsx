// src/pages/plataforma/AyudantiaPlataforma.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, CircularProgress, Button, Chip, Divider } from "@mui/material";
import ArrowBackIcon       from "@mui/icons-material/ArrowBack";
import DescriptionIcon     from "@mui/icons-material/Description";
import VideoLibraryIcon    from "@mui/icons-material/VideoLibrary";
import { fetchConToken }              from "../../helpers/fetch";
import { calcularIndicador }          from "../../helpers/indicadorIntento";
import TiptapRenderer                 from "../../components/CKEditor/TiptapRenderer";
import { chapter } from "../../db/db";

const AyudantiaPlataforma = () => {
  const { curso_id, capitulo_id, ayudantia_id } = useParams<{
    curso_id: string; capitulo_id: string; ayudantia_id: string;
  }>();
  const navigate = useNavigate();

  const [data,      setData]      = useState<{ solucion: { texto: string } | null; video: { titulo: string; url: string } | null; quiz: { _id: string; titulo: string; intentos: number; umbral_aprobacion: number; ultimo_intento: null } | null } | null>(null);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    if (!ayudantia_id) return;
    fetchConToken(`api/plataforma/ayudantias/${ayudantia_id}`)
      .then((r) => r.json())
      .then((body) => { if (body.ok) setData(body.data); })
      .finally(() => setCargando(false));
  }, [ayudantia_id]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">
        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}`)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Volver al {chapter.name}
        </Button>

        {cargando && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}

        {data && (
          <div className="flex flex-col gap-4">

            {/* Solución */}
            {data.solucion?.texto && (
              <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee]">
                <div className="flex items-center gap-2 mb-3">
                  <DescriptionIcon sx={{ color: "#4A6D8C", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>Solución</Typography>
                </div>
                <Divider sx={{ mb: 2 }} />
                <TiptapRenderer>{data.solucion.texto}</TiptapRenderer>
              </div>
            )}

            {/* Video */}
            {data.video?.url && (
              <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee]">
                <div className="flex items-center gap-2 mb-3">
                  <VideoLibraryIcon sx={{ color: "#e03030", fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>{data.video.titulo}</Typography>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: "#000" }}>
                  <iframe src={data.video.url} style={{ width: "100%", aspectRatio: "16/9", border: "none", display: "block" }}
                    allowFullScreen title={data.video.titulo} />
                </div>
              </div>
            )}

            {/* Quiz */}
            {data.quiz && (() => {
              const ind = calcularIndicador(data.quiz!.ultimo_intento, data.quiz!.intentos, data.quiz!.umbral_aprobacion);
              return (
                <div className="bg-white rounded-2xl p-5 border border-[#d9e4ee]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 20 }}>{ind.icono || "📝"}</span>
                      <div>
                        <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>{data.quiz!.titulo}</Typography>
                        <Typography variant="caption" sx={{ color: "#8daecb" }}>
                          {data.quiz!.intentos === 0 ? "Intentos ilimitados" : `${data.quiz!.intentos} intento${data.quiz!.intentos !== 1 ? "s" : ""}`} · Aprobación: {data.quiz!.umbral_aprobacion}%
                        </Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ind.estado !== "sin_intentos" && (
                        <Chip label={ind.label} size="small"
                          sx={{ fontSize: "0.65rem", bgcolor: `${ind.color}20`, color: ind.color, fontWeight: 600 }} />
                      )}
                      <Button variant="contained" disabled={ind.estado === "agotado"}
                        onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ayudantia_id}/quiz/${data.quiz!._id}`)}
                        sx={{ bgcolor: "#2d5be3", borderRadius: 2, fontWeight: 600, boxShadow: "none",
                          "&:hover": { bgcolor: "#1a3cb0", boxShadow: "none" } }}>
                        {ind.estado === "agotado" ? "Agotado" : ind.estado === "sin_intentos" ? "Iniciar quiz" : "Reintentar"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>
    </div>
  );
};

export default AyudantiaPlataforma;