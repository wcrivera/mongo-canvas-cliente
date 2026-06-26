import { Dialog, DialogContent, IconButton } from "@mui/material";
import type { IConfigReveal, ISlide } from "@/EditorDiapositiva";
import SlidePreview from "./SlidePreview";

import CloseIcon from "@mui/icons-material/Close";

type ModalPreviewProps = {
  modalPreview: number | null;
  setModalPreview: (index: number | null) => void;
  slides: ISlide[];
  config: IConfigReveal;
};

const ModalPreview = ({
  modalPreview,
  setModalPreview,
  slides,
  config,
}: ModalPreviewProps) => {
  return (
    <Dialog
      open={modalPreview !== null}
      onClose={() => setModalPreview(null)}
      fullWidth={true}
      fullScreen
    >
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <IconButton
          size="small"
          onClick={() => setModalPreview(null)}
          style={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        {/* {modalPreview !== null && (
          <PreviewFit slide={slides[modalPreview]} config={config} />
        )} */}

        <SlidePreview
          slides={slides}
          config={config}
          width={1280}
          height={800}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ModalPreview;
