// src/pages/plataforma/CapitulosPlataforma.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, CircularProgress, Card, CardContent, Button } from "@mui/material";
import ArrowBackIcon    from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { obtenerCapitulosPlataforma, obtenerCursosPlataforma } from "../../store/slices/plataforma";

const CapitulosPlataforma = () => {
  const { curso_id } = useParams<{ curso_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { capitulos, cursos, isLoading } = useAppSelector((s) => s.plataforma);
  const curso = cursos.find((c) => c._id === curso_id);

  useEffect(() => {
    if (!curso_id) return;
    if (cursos.length === 0) dispatch(obtenerCursosPlataforma());
    dispatch(obtenerCapitulosPlataforma({ curso_id }));
  }, [curso_id, cursos.length, dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/plataforma")}
          sx={{ color: "#6793ba", mb: 3, "&:hover": { bgcolor: "transparent", color: "#4A6D8C" } }}>
          Mis cursos
        </Button>

        {curso && (
          <div className="mb-8">
            <Typography variant="caption" sx={{ color: "#8daecb", fontWeight: 600, textTransform: "uppercase" }}>
              {curso.codigo}
            </Typography>
            <Typography variant="h5" sx={{ color: "#1f2c38", fontWeight: 600 }}>{curso.nombre}</Typography>
          </div>
        )}

        {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}

        <div className="flex flex-col gap-3">
          {capitulos.map((cap) => (
            <Card key={cap._id} elevation={0}
              sx={{ borderRadius: 3, border: "1px solid #d9e4ee", opacity: cap.published_api ? 1 : 0.45,
                "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.1)" } }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px !important" }}>
                <div>
                  <Typography variant="caption" sx={{ color: "#8daecb" }}>Capítulo {cap.position}</Typography>
                  <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600 }}>{cap.nombre}</Typography>
                </div>
                <Button endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/plataforma/cursos/${curso_id}/capitulos/${cap._id}`)}
                  sx={{ color: "#4A6D8C", fontWeight: 600, "&:hover": { bgcolor: "#f0f4f8" } }}>
                  Ver
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CapitulosPlataforma;