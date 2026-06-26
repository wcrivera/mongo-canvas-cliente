import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
// import Diapositiva from "./Diapositiva";
import type { IDiapositiva } from "@/store/slices/diapositiva";
import Diapositivas from "./Diapositivas";

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
      maxWidth="lg"
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
          p: "0px !important",
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
          diapoTema.slides && (
            <Diapositivas
              slides={diapoTema.slides}
              config={diapoTema.config}
              width={1280}
              height={720}
            />
          )
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalVerDiapositiva;
