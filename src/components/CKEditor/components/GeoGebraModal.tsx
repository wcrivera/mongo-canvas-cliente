import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { GeoGebraParams } from "../plugins/InsertGeoGebraPlugin";

interface GeoGebraModalProps {
  onInsert: (params: GeoGebraParams) => void;
  onClose: () => void;
}

export function GeoGebraModal({ onInsert, onClose }: GeoGebraModalProps) {
  const [id, setId] = useState("");
  const [width, setWidth] = useState("570");
  const [height, setHeight] = useState("330");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");

  const idLimpio = id.trim();
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  const valido = idLimpio !== "" && w > 0 && h > 0;

  const handleInsert = () => {
    if (!valido) return;
    onInsert({ id: idLimpio, width: w, height: h, align });
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#1E293B", color: "#fff", fontWeight: 600 }}>
        Insertar GeoGebra
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ID del material"
            placeholder="ej: rgyjbgze"
            value={id}
            onChange={(e) => setId(e.target.value)}
            helperText="El ID aparece en la URL de GeoGebra: geogebra.org/m/{ID}"
            fullWidth
            autoFocus
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Ancho (px)"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              fullWidth
            />
            <TextField
              label="Alto (px)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              fullWidth
            />
            <ToggleButtonGroup
              value={align}
              exclusive
              onChange={(_e, val) => val && setAlign(val)}
              size="small"
              fullWidth
            >
              <ToggleButton value="left">Izquierda</ToggleButton>
              <ToggleButton value="center">Centro</ToggleButton>
              <ToggleButton value="right">Derecha</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleInsert}
          variant="contained"
          disabled={!valido}
          sx={{ bgcolor: "#0D9488", "&:hover": { bgcolor: "#0f766e" } }}
        >
          Insertar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
