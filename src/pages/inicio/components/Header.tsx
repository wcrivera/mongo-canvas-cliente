import { Button, Typography } from "@mui/material";

import type { IMongoCurso } from "@/store/slices/mongoCurso";

import AddIcon from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";

interface Props {
  cursos: IMongoCurso[];
  setModalNuevo: (open: boolean) => void;
}

const Header = ({ cursos, setModalNuevo }: Props) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center">
          <MenuBookIcon sx={{ color: "#2563EB", fontSize: 22 }} />
        </div>
        <div>
          <Typography
            variant="h5"
            sx={{
              color: "#1E293B",
              fontWeight: 500,
              lineHeight: 1.2,
              fontSize: "22px",
            }}
          >
            Mis cursos
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#94A3B8", fontSize: "13px" }}
          >
            {cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado
            {cursos.length !== 1 ? "s" : ""}
          </Typography>
        </div>
      </div>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setModalNuevo(true)}
        sx={{
          borderRadius: "10px",
          px: 2.5,
          py: 1.2,
          fontWeight: 500,
          fontSize: "13px",
          boxShadow: "none",
          textTransform: "none",
        }}
      >
        Nuevo curso
      </Button>
    </div>
  );
};

export default Header;
