// src/pages/capitulos/Capitulos.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayersIcon from "@mui/icons-material/Layers";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerCapitulos,
  crearCapitulo,
  limpiarCapitulos,
} from "../../store/slices/capitulo";
import { obtenerClasesPorCurso, limpiarClases } from "../../store/slices/clase";
import { obtenerTemasPorCurso, limpiarTemas } from "../../store/slices/tema";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { generarHtmlCapitulos } from "./generarHtmlCapitulos";
import CapituloCard from "./CapituloCard";

// interface ResultadoDeploy {
//   ok: boolean;
//   msg?: string;
//   errores?: unknown[];
// }

// const generarSlug = (codigo: string, tipo: string): string => {
//   return `${codigo}-${tipo}`
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9-]/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// };

const Capitulos = () => {
  const { curso_id } = useParams<{ curso_id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { capitulos, isLoading, error } = useAppSelector(
    (s) => s.capituloMongo,
  );
  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);
  const { clases } = useAppSelector((s) => s.claseMongo);
  const { temas } = useAppSelector((s) => s.temaMongo);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", published: false });
  const [guardando, setGuardando] = useState(false);
  const [desplegando, setDesplegando] = useState(false);
  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  useEffect(() => {
    if (!curso_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerClasesPorCurso({ curso_id }));
    dispatch(obtenerTemasPorCurso({ curso_id }));
    return () => {
      dispatch(limpiarCapitulos());
      dispatch(limpiarClases());
      dispatch(limpiarTemas());
    };
  }, [curso_id, dispatch]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !curso_id) return;
    setGuardando(true);
    await dispatch(crearCapitulo({ curso_id, ...form }));
    setGuardando(false);
    setForm({ nombre: "", published: false });
    setMostrarForm(false);
  };

  const handleDesplegarPagina = async () => {
  if (!cursoActivo) return;

  const canvas_activos = cursoActivo.canvas_cursos.filter((c) => c.activo);

  if (canvas_activos.length === 0) {
    setMsgDeploy("No hay cursos Canvas activos asociados.");
    return;
  }

  setDesplegando(true);
  setMsgDeploy(null);

  await Promise.allSettled(
    canvas_activos.map(async ({ canvas_id }) => {
      const body = generarHtmlCapitulos({
        curso:           cursoActivo,
        capitulos,
        clases,
        temas,
        canvas_curso_id: canvas_id,
      });

      // Título sin caracteres especiales → Canvas genera slug predecible
      const titulo = `${cursoActivo.codigo} Capitulos`;
      // Canvas generará: {codigo}-capitulos  ej: mat1000-capitulos
      const slug   = `${cursoActivo.codigo.toLowerCase()}-capitulos`;

      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/capitulos/deploy-pagina/${canvas_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, slug, body }),
        }
      );
    })
  );

  setDesplegando(false);
  setMsgDeploy("✓ Página publicada en todos los cursos Canvas");
};

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/inicio")}
            sx={{ color: "#6793ba", borderRadius: 2, mr: 1 }}
          >
            Volver
          </Button>
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: "#4A6D8C" }}
          >
            <LayersIcon sx={{ color: "white", fontSize: 22 }} />
          </div>
          <div>
            <Typography
              variant="h5"
              sx={{ color: "#1f2c38", lineHeight: 1.2, fontWeight: 700 }}
            >
              Capítulos
            </Typography>
            <Typography variant="caption" sx={{ color: "#6793ba" }}>
              {cursoActivo
                ? `${cursoActivo.codigo} · ${cursoActivo.nombre}`
                : "Cargando..."}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handleDesplegarPagina}
            disabled={desplegando || capitulos.length === 0}
            startIcon={
              desplegando ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            sx={{
              borderColor: "#4A6D8C",
              color: "#4A6D8C",
              borderRadius: 2.5,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#f0f4f8", borderColor: "#3c5770" },
            }}
          >
            {desplegando ? "Publicando..." : "Publicar en Canvas"}
          </Button>

          <Button
            variant="contained"
            startIcon={mostrarForm ? undefined : <AddIcon />}
            onClick={() => setMostrarForm((v) => !v)}
            sx={{
              bgcolor: mostrarForm ? "#6793ba" : "#4A6D8C",
              borderRadius: 2.5,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
            }}
          >
            {mostrarForm ? "Cancelar" : "Nuevo capítulo"}
          </Button>
        </div>
      </div>

      {/* ── Mensaje deploy ── */}
      {msgDeploy && (
        <Alert
          severity={msgDeploy.startsWith("✓") ? "success" : "error"}
          onClose={() => setMsgDeploy(null)}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          {msgDeploy}
        </Alert>
      )}

      {/* ── Formulario ── */}
      {mostrarForm && (
        <form
          onSubmit={handleCrear}
          className="mb-8 rounded-2xl p-6 animate-slideDown"
          style={{
            background: "white",
            border: "1px solid #d9e4ee",
            boxShadow: "0 4px 16px rgba(74,109,140,0.08)",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ color: "#2e4154", mb: 3, fontWeight: 600 }}
          >
            Nuevo capítulo
          </Typography>

          <div className="flex flex-col gap-4">
            <TextField
              label="Nombre del capítulo"
              placeholder="ej: Límites y continuidad"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              required
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  sx={{
                    "& .MuiSwitch-thumb": {
                      bgcolor: form.published ? "#4A6D8C" : "#ccc",
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#3c5770" }}>
                  {form.published ? "Publicado en Canvas" : "No publicado"}
                </Typography>
              }
            />
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <Button
              variant="text"
              onClick={() => setMostrarForm(false)}
              sx={{ color: "#6793ba", borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={guardando}
              startIcon={
                guardando ? (
                  <CircularProgress size={14} color="inherit" />
                ) : undefined
              }
              sx={{
                bgcolor: "#4A6D8C",
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
              }}
            >
              {guardando ? "Creando..." : "Crear capítulo"}
            </Button>
          </div>
        </form>
      )}

      {/* ── Estados ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <CircularProgress sx={{ color: "#4A6D8C" }} />
        </div>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && capitulos.length === 0 && !error && (
        <div className="flex flex-col items-center gap-3 py-20 animate-fadeIn">
          <LayersIcon sx={{ fontSize: 56, color: "#b3c9dd" }} />
          <Typography
            variant="body1"
            sx={{ color: "#6793ba", fontWeight: 500 }}
          >
            No hay capítulos
          </Typography>
          <Typography variant="body2" sx={{ color: "#8daecb" }}>
            Crea el primero con el botón "Nuevo capítulo"
          </Typography>
        </div>
      )}

      {/* ── Lista ── */}
      {!isLoading && capitulos.length > 0 && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {capitulos.map((cap, idx) => (
            <CapituloCard
              key={cap._id}
              capitulo={cap}
              curso_id={curso_id!}
              esPrimero={idx === 0}
              esUltimo={idx === capitulos.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Capitulos;
