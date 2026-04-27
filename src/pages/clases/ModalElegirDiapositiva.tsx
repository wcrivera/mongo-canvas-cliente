// src/pages/clases/ModalElegirDiapositiva.tsx
import {
  Dialog, DialogTitle, DialogContent,
  Typography, IconButton,
} from "@mui/material";
import CloseIcon      from "@mui/icons-material/Close";
import LinkIcon       from "@mui/icons-material/Link";
import EditNoteIcon   from "@mui/icons-material/EditNote";
import SlideshowIcon  from "@mui/icons-material/Slideshow";

interface Props {
  onElegirUrl:    () => void;
  onElegirEditor: () => void;
  onClose:        () => void;
}

const ModalElegirDiapositiva = ({ onElegirUrl, onElegirEditor, onClose }: Props) => {
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: "#f47c3c",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          px: 3,
        }}
      >
        <div className="flex items-center gap-2">
          <SlideshowIcon sx={{ fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Agregar diapositiva</span>
        </div>
        <IconButton
          onClick={onClose}
          sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3, px: 3 }}>
        <Typography variant="body2" sx={{ color: "#6793ba", mb: 3, textAlign: "center" }}>
          ¿Cómo quieres agregar la diapositiva?
        </Typography>

        <div className="flex flex-col gap-3">
          {/* Opción URL */}
          <button
            onClick={onElegirUrl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              borderRadius: 12,
              border: "1.5px solid #d9e4ee",
              background: "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#f47c3c";
              (e.currentTarget as HTMLButtonElement).style.background = "#fff8f5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#d9e4ee";
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "#fff0e8",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <LinkIcon sx={{ color: "#f47c3c", fontSize: 22 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>
                Usar URL externa
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Google Slides, Canva, PowerPoint Online...
              </div>
            </div>
          </button>

          {/* Opción Editor */}
          <button
            onClick={onElegirEditor}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px 20px",
              borderRadius: 12,
              border: "1.5px solid #d9e4ee",
              background: "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#4A6D8C";
              (e.currentTarget as HTMLButtonElement).style.background = "#f0f4f8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#d9e4ee";
              (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "#e8eef4",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <EditNoteIcon sx={{ color: "#4A6D8C", fontSize: 22 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>
                Crear con editor
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                Editor Reveal.js integrado con preview en vivo
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalElegirDiapositiva;