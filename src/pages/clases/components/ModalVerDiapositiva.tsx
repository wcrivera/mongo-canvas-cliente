import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Diapositiva from "./Diapositiva";
import type { IDiapositiva } from "../../../store/slices/diapositiva";

interface ModalVerProps {
  label: string;
  diapoTema: IDiapositiva;
  onClose: () => void;
}

const ModalVerDiapositiva: React.FC<ModalVerProps> = ({
  label,
  diapoTema,
  onClose,
}) => {
  console.log("diapositiva", diapoTema);
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiDialog-paper": { borderRadius: "14px" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1E293B",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        {label}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: "20px !important",
          pb: 1,
          overflow: "visible",
          justifyContent: "center",
          display: "flex",
        }}
      >
        {diapoTema.url ? (
          <iframe
            src={diapoTema.url}
            title="Diapositiva"
            width="600px"
            height="400px"
            style={{ border: "none", borderRadius: 8 }}
          />
        ) : (
          diapoTema.slides &&
          diapoTema.slides.length > 0 && 
          diapoTema.slides.map((slide, index) => (
            <Diapositiva
              key={index}
              slide={slide}
              config={diapoTema.config}
              width={600}
              height={400}
            />
          ))
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalVerDiapositiva;
