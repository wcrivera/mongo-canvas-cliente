import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  editarAyudantia,
  type IAyudantia,
} from "@/store/slices/ayudantia";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import MathTextEditor from "@/components/CKEditor/MathTextEditor";

import EditNoteIcon from "@mui/icons-material/EditNote";
import { normalizeForEditor } from "@/components/CKEditor/mathUtils";

export const ModalEnunciado = ({
  ayudantia,
  onClose,
}: {
  ayudantia: IAyudantia;
  onClose: () => void;
}) => {
  const dispatch = useAppDispatch();
  const siglaCurso = useAppSelector(
    (s) => s.mongoCurso.cursoActivo?.codigo ?? "",
  );
  const [contenido, setContenido] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    setGuardando(true);
    await dispatch(
      editarAyudantia({ ayudantia_id: ayudantia._id, enunciado: contenido }),
    );
    setGuardando(false);
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px" } } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1E293B",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          px: 3,
          fontFamily: "Georgia, serif",
          fontSize: "17px",
          fontWeight: "normal",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "#2563EB",
            border: "1px solid #3B82F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <EditNoteIcon sx={{ fontSize: 16, color: "white" }} />
        </div>
        {ayudantia.enunciado ? "Editar enunciado" : "Agregar enunciado"}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <MathTextEditor
          initialData={normalizeForEditor(ayudantia.enunciado ?? "")}
          onChange={setContenido}
          siglaCurso={siglaCurso}
          // placeholder="Escribe el enunciado de la ayudantía..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "#94A3B8",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": { bgcolor: "#F8FAFC" },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          disabled={guardando}
          startIcon={
            guardando ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
          sx={{
            bgcolor: "#2563EB",
            borderRadius: "8px",
            px: 2.5,
            fontWeight: 500,
            fontSize: "13px",
            textTransform: "none",
            boxShadow: "none",
            "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
          }}
        >
          {guardando ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
