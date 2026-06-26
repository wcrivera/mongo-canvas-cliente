// src/pages/plataforma/Plataforma.tsx — Lista de cursos disponibles
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, CircularProgress, Card, CardContent, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SchoolIcon       from "@mui/icons-material/School";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { obtenerCursosPlataforma } from "@/store/slices/plataforma";

const Plataforma = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cursos, isLoading } = useAppSelector((s) => s.plataforma);

  useEffect(() => { dispatch(obtenerCursosPlataforma()); }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Typography variant="h5" sx={{ color: "#1f2c38", fontWeight: 600 }}>
            Mis cursos
          </Typography>
          <Typography variant="body2" sx={{ color: "#6793ba", mt: 0.5 }}>
            Selecciona un curso para ver su contenido
          </Typography>
        </div>

        {isLoading && <div className="flex justify-center py-16"><CircularProgress sx={{ color: "#4A6D8C" }} /></div>}

        {!isLoading && cursos.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20">
            <SchoolIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
            <Typography variant="body1" sx={{ color: "#6793ba" }}>No hay cursos disponibles</Typography>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {cursos.map((curso) => (
            <Card key={curso._id} elevation={0}
              sx={{ borderRadius: 3, border: "1px solid #d9e4ee", opacity: curso.published_api ? 1 : 0.45,
                "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.1)" } }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px !important" }}>
                <div>
                  <Typography variant="caption" sx={{ color: "#8daecb", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {curso.codigo}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#1f2c38", fontWeight: 600, lineHeight: 1.3 }}>
                    {curso.nombre}
                  </Typography>
                  {curso.descripcion && (
                    <Typography variant="body2" sx={{ color: "#6793ba", mt: 0.5 }}>{curso.descripcion}</Typography>
                  )}
                </div>
                <Button endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/plataforma/cursos/${curso._id}`)}
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

export default Plataforma;