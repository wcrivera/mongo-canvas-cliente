import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  Switch,
  Button,
  CircularProgress,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  editarClase,
  eliminarClase,
  cambiarPositionClase,
} from "../../store/slices/clase";
import { crearTema } from "../../store/slices/tema";
import type { IClase } from "../../store/slices/clase";
import TemaRow from "./TemaRow";
import LatexRenderer from "../../components/LaTeX/LatexRenderer";

interface Props {
  clase: IClase;
  esPrimero: boolean;
  esUltimo: boolean;
}

const ClaseCard = ({ clase, esPrimero, esUltimo }: Props) => {
  const dispatch = useAppDispatch();
  const { temas } = useAppSelector((s) => s.temaMongo);

  const temasClase = temas
    .filter((t) => t.clase_id === clase._id)
    .sort((a, b) => a.position - b.position);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [creandoTema, setCreandoTema] = useState(false);
  const [mostrarFormTema, setMostrarFormTema] = useState(false);
  const [nombreTema, setNombreTema] = useState("");
  const [form, setForm] = useState({
    nombre: clase.nombre,
    published: clase.published,
  });

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(editarClase({ clase_id: clase._id, ...form }));
    setGuardando(false);
    setEditando(false);
  };

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar clase "${clase.nombre}"?`)) return;
    setEliminando(true);
    await dispatch(eliminarClase({ clase_id: clase._id }));
    setEliminando(false);
  };

  const handleMoverArriba = () =>
    dispatch(cambiarPositionClase({ clase_id: clase._id, direction: "up" }));

  const handleMoverAbajo = () =>
    dispatch(cambiarPositionClase({ clase_id: clase._id, direction: "down" }));

  const handleCrearTema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTema.trim()) return;
    setCreandoTema(true);
    await dispatch(crearTema({ clase_id: clase._id, nombre: nombreTema }));
    setCreandoTema(false);
    setNombreTema("");
    setMostrarFormTema(false);
  };

  return (
    <Card
      elevation={0}
      className="animate-fadeIn"
      sx={{
        borderRadius: 3,
        border: "1px solid #e0e0e0",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(74,109,140,0.08)" },
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* ── Header de la clase ── */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Avatar circular */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 22,
            }}
          >
            🎓
          </div>

          {/* Info o form edición */}
          <div className="flex-1 min-w-0">
            {editando ? (
              <div className="flex flex-col gap-2">
                <TextField
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  size="small"
                  autoFocus
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <div className="flex items-center gap-2">
                  <Switch
                    size="small"
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
                  <Typography variant="caption" sx={{ color: "#6793ba" }}>
                    {form.published ? "Publicada" : "No publicada"}
                  </Typography>
                </div>
              </div>
            ) : (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#a0a0a0",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Clase {clase.position}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#3d3d3d", fontWeight: 500, mt: 0.3 }}
                  noWrap
                >
                  <LatexRenderer>{clase.nombre}</LatexRenderer>
                </Typography>
              </>
            )}
          </div>

          {/* Controles admin */}
          <div className="flex items-center gap-0.5 shrink-0">
            {editando ? (
              <>
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
                      setForm({
                        nombre: clase.nombre,
                        published: clase.published,
                      });
                    }}
                    sx={{ color: "#8daecb" }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => setEditando(true)}
                    sx={{
                      color: "#8daecb",
                      "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
                    }}
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
                      sx={{
                        color: "#8daecb",
                        "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
                      }}
                    >
                      {eliminando ? (
                        <CircularProgress size={14} />
                      ) : (
                        <DeleteOutlineIcon fontSize="small" />
                      )}
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
              </>
            )}
          </div>
        </div>

        {/* ── Temas ── */}
        {temasClase.map((tema) => (
          <TemaRow key={tema._id} tema={tema} />
        ))}

        {/* ── Formulario nuevo tema ── */}
        {mostrarFormTema && (
          <div
            style={{ borderTop: "1px solid #e0e0e0" }}
            className="px-5 py-3 animate-slideDown"
          >
            <form
              onSubmit={handleCrearTema}
              className="flex items-center gap-2"
            >
              <TextField
                value={nombreTema}
                onChange={(e) => setNombreTema(e.target.value)}
                placeholder="Nombre del tema"
                size="small"
                autoFocus
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 },
                }}
              />
              <Button
                type="submit"
                size="small"
                variant="contained"
                disabled={creandoTema || !nombreTema.trim()}
                sx={{
                  bgcolor: "#4A6D8C",
                  borderRadius: 2,
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
                }}
              >
                {creandoTema ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  "Agregar"
                )}
              </Button>
              <IconButton
                size="small"
                onClick={() => {
                  setMostrarFormTema(false);
                  setNombreTema("");
                }}
                sx={{ color: "#8daecb" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </form>
          </div>
        )}

        {/* ── Botón agregar tema ── */}
        {!mostrarFormTema && (
          <div style={{ borderTop: "1px solid #f0f0f0" }} className="px-5 py-2">
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setMostrarFormTema(true)}
              sx={{
                color: "#8daecb",
                fontSize: "0.75rem",
                "&:hover": { color: "#4A6D8C", bgcolor: "#f0f4f8" },
              }}
            >
              Agregar tema
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaseCard;
