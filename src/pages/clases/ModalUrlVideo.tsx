import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField,
  Typography, CircularProgress,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import { useAppDispatch } from "../../store/hooks";
import { crearVideo, editarUrlVideo } from "../../store/slices/video";
import type { IVideo } from "../../store/slices/video";

interface Props {
  recurso_id: string;
  video?:     IVideo;
  onClose:    () => void;
}

const getEmbedUrl = (url: string): string => {
  try {
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop()?.split('?')[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
};

const ModalUrlVideo = ({ recurso_id, video, onClose }: Props) => {
  const dispatch  = useAppDispatch();
  const [url, setUrl]             = useState(video?.url ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const esEdicion = !!video;
  const embedUrl  = getEmbedUrl(url);

  const handleGuardar = async () => {
    if (!url.trim()) {
      setError("La URL es requerida");
      return;
    }
    setError(null);
    setGuardando(true);

    let resultado;
    if (esEdicion) {
      resultado = await dispatch(
        editarUrlVideo({ video_id: video._id, url })
      );
    } else {
      resultado = await dispatch(
        crearVideo({ recurso_id, url })
      );
    }

    setGuardando(false);

    if ((resultado as { ok: boolean }).ok) {
      onClose();
    } else {
      setError("Error al guardar el video");
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3, overflow: "hidden" } }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#e03030",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <PlayCircleOutlineIcon />
        <span>{esEdicion ? "Editar video" : "Agregar video"}</span>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "#6793ba", mb: 2 }}>
          Ingresa la URL del video de Vimeo
        </Typography>

        <TextField
          label="URL del video"
          placeholder="https://vimeo.com/123456789"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          error={!!error}
          helperText={error ?? ""}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        {/* Preview */}
        {url.trim() && (
          <div
            className="mt-4 rounded-xl overflow-hidden animate-fadeIn"
            style={{
              border: "1px solid #d9e4ee",
              background: "#000",
              position: "relative",
              paddingTop: "56.25%",
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: "100%", height: "100%",
                border: "none",
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Preview video"
            />
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{ color: "#6793ba", borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando || !url.trim()}
          startIcon={
            guardando
              ? <CircularProgress size={14} color="inherit" />
              : undefined
          }
          sx={{
            bgcolor: "#e03030",
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#b02020", boxShadow: "none" },
            "&:disabled": { bgcolor: "#f5b0b0" },
          }}
        >
          {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalUrlVideo;