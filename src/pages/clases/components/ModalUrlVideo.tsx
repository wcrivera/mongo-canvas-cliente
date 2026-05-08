import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, CircularProgress,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import { useAppDispatch } from "../../../store/hooks";
import { crearVideo, editarUrlVideo, eliminarVideo } from "../../../store/slices/video";
import type { IVideo } from "../../../store/slices/video";

interface Props {
  contexto:      "clase" | "ayudantia";
  tema_id?:      string;
  ayudantia_id?: string;
  capitulo_id:   string;
  curso_id:      string;
  titulo:        string;
  video?:        IVideo;
  onClose:       () => void;
}

const getEmbedUrl = (url: string): string => {
  try {
    if (url.includes("vimeo.com")) {
      const id = url.split("/").pop()?.split("?")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
};

const ModalUrlVideo = ({ contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, video, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const [url,        setUrl]        = useState(video?.url ?? "");
  const [guardando,  setGuardando]  = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const esEdicion = !!video;

  const handleGuardar = async () => {
    if (!url.trim()) { setError("La URL es requerida"); return; }
    setError(null);
    setGuardando(true);
    let resultado;
    if (esEdicion) {
      resultado = await dispatch(editarUrlVideo({ video_id: video._id, url }));
    } else {
      resultado = await dispatch(crearVideo({ contexto, tema_id, ayudantia_id, capitulo_id, curso_id, titulo, url }));
    }
    setGuardando(false);
    if ((resultado as { ok: boolean }).ok) { onClose(); }
    else { setError("Error al guardar el video"); }
  };

  const handleEliminar = async () => {
    if (!video) return;
    setEliminando(true);
    await dispatch(eliminarVideo({ video_id: video._id }));
    setEliminando(false);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
      <DialogTitle sx={{ bgcolor: "#e03030", color: "white", display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <PlayCircleOutlineIcon />
        <span>{esEdicion ? "Editar video" : "Agregar video"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#6793ba", mb: 2 }}>
          Ingresa la URL del video (YouTube, Vimeo, etc.)
        </Typography>
        <TextField
          label="URL del video"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth size="small" autoFocus
          error={!!error} helperText={error ?? ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        {url.trim() && (
          <div className="mt-4 rounded-xl overflow-hidden animate-fadeIn"
            style={{ border: "1px solid #d9e4ee" }}>
            <div style={{ padding: "8px 12px", background: "#f0f4f8", fontSize: 11, color: "#6793ba", fontWeight: 500 }}>
              Preview
            </div>
            <iframe
              src={getEmbedUrl(url)}
              style={{ width: "100%", height: 200, border: "none", display: "block" }}
              title="Preview video"
              allowFullScreen
            />
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <div>
          {esEdicion && (
            <Button onClick={handleEliminar} variant="text" disabled={eliminando}
              startIcon={eliminando ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ color: "#dc2626", borderRadius: 2, "&:hover": { bgcolor: "#fef2f2" } }}>
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} variant="contained"
            disabled={guardando || !url.trim()}
            startIcon={guardando ? <CircularProgress size={14} color="inherit" /> : undefined}
            sx={{ bgcolor: "#e03030", borderRadius: 2, px: 3, fontWeight: 600, boxShadow: "none",
              "&:hover": { bgcolor: "#b02020", boxShadow: "none" },
              "&:disabled": { bgcolor: "#f5b0b0" } }}>
            {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ModalUrlVideo;