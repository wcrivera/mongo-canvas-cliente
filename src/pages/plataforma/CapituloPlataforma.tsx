// src/pages/plataforma/CapituloPlataforma.tsx — Clases, ayudantías y ejercicios
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography, CircularProgress, Card, CardContent, Button, Chip,
} from "@mui/material";
import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { obtenerCapituloPlataforma } from "../../store/slices/plataforma";
import { calcularIndicador } from "../../helpers/indicadorIntento";

const CapituloPlataforma = () => {
  const { curso_id, capitulo_id } = useParams<{ curso_id: string; capitulo_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clases, ayudantias, ejercicios, isLoading } = useAppSelector((s) => s.plataforma);

  useEffect(() => {
    if (capitulo_id) dispatch(obtenerCapituloPlataforma({ capitulo_id }));
  }, [capitulo_id, dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">
        <Button startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/plataforma/cursos/${curso_id}`)}
          sx={{ color: "#6793ba", mb: 3 }}>
          Capítulos
        </Button>

        {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}

        {/* ── Clases ── */}
        {clases.length > 0 && (
          <div className="mb-8">
            <Typography variant="h6" sx={{ color: "#1f2c38", fontWeight: 600, mb: 2 }}>Clases</Typography>
            <div className="flex flex-col gap-3">
              {clases.map((clase) => (
                <Card key={clase._id} elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #d9e4ee", opacity: clase.published_api ? 1 : 0.45 }}>
                  <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 20px !important" }}>
                    <div>
                      <Typography variant="caption" sx={{ color: "#8daecb" }}>Clase {clase.position}</Typography>
                      <Typography variant="subtitle2" sx={{ color: "#1f2c38", fontWeight: 600 }}>{clase.nombre}</Typography>
                    </div>
                    <Button endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/clases/${clase._id}`)}
                      sx={{ color: "#4A6D8C", fontWeight: 600 }}>Ver</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Ayudantías ── */}
        {ayudantias.length > 0 && (
          <div className="mb-8">
            <Typography variant="h6" sx={{ color: "#1f2c38", fontWeight: 600, mb: 2 }}>Ayudantías</Typography>
            <div className="flex flex-col gap-3">
              {ayudantias.map((ay) => (
                <Card key={ay._id} elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #d9e4ee", opacity: ay.published_api ? 1 : 0.45 }}>
                  <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 20px !important" }}>
                    <Typography variant="subtitle2" sx={{ color: "#1f2c38", fontWeight: 600 }}>{ay.nombre}</Typography>
                    <Button endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/ayudantias/${ay._id}`)}
                      sx={{ color: "#4A6D8C", fontWeight: 600 }}>Ver</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── Ejercicios ── */}
        {ejercicios.length > 0 && (
          <div className="mb-8">
            <Typography variant="h6" sx={{ color: "#1f2c38", fontWeight: 600, mb: 2 }}>Ejercicios</Typography>
            <div className="flex flex-col gap-3">
              {ejercicios.map((ej, idx) => {
                const ind = calcularIndicador(ej.ultimo_intento, ej.intentos, ej.umbral_aprobacion);
                return (
                  <Card key={ej._id} elevation={0}
                    sx={{ borderRadius: 3, border: "1px solid #d9e4ee", opacity: ej.published_api ? 1 : 0.45 }}>
                    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "14px 20px !important" }}>
                      <div className="flex items-center gap-3">
                        {ind.icono && <span style={{ fontSize: 20 }}>{ind.icono}</span>}
                        <div>
                          <Typography variant="caption" sx={{ color: "#8daecb" }}>Ejercicio {idx + 1}</Typography>
                          <Typography variant="subtitle2" sx={{ color: "#1f2c38", fontWeight: 600 }}>{ej.titulo}</Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ind.estado !== "sin_intentos" && (
                          <Chip label={ind.label} size="small"
                            sx={{ fontSize: "0.65rem", bgcolor: `${ind.color}20`, color: ind.color, fontWeight: 600 }} />
                        )}
                        <Button endIcon={<ArrowForwardIcon />}
                          disabled={ind.estado === "agotado"}
                          onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${capitulo_id}/ejercicios/${ej._id}`)}
                          sx={{ color: "#4A6D8C", fontWeight: 600 }}>
                          {ind.estado === "agotado" ? "Agotado" : "Responder"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapituloPlataforma;