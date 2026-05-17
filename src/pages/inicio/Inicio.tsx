// src/pages/inicio/Inicio.tsx
import { useEffect, useState }    from "react";
import { Button, Typography, CircularProgress, Alert } from "@mui/material";
import AddIcon      from "@mui/icons-material/Add";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerMongoCursos,
  type IMongoCurso,
} from "../../store/slices/mongoCurso";
import MongoCursoCard         from "./components/MongoCursoCard";
import { ModalEditarCurso }   from "./components/ModalEditarCurso";
import { ModalEliminarCurso } from "./components/ModalEliminarCurso";
import { ModalNuevoCurso }    from "./components/ModalNuevoCurso";

// ─── Página principal ─────────────────────────────────────────────────────────

const Inicio = () => {
  const dispatch = useAppDispatch();
  const { cursos, isLoading, error } = useAppSelector((s) => s.mongoCurso);

  const [modalNuevo,    setModalNuevo]    = useState(false);
  const [modalEditar,   setModalEditar]   = useState<IMongoCurso | null>(null);
  const [modalEliminar, setModalEliminar] = useState<IMongoCurso | null>(null);

  useEffect(() => {
    dispatch(obtenerMongoCursos());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center">
              <MenuBookIcon sx={{ color: "#2563EB", fontSize: 22 }} />
            </div>
            <div>
              <Typography
                variant="h5"
                sx={{ color: "#1E293B", fontWeight: 500, lineHeight: 1.2, fontSize: "22px" }}
              >
                Mis cursos
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "13px" }}>
                {cursos.length} curso{cursos.length !== 1 ? "s" : ""} registrado{cursos.length !== 1 ? "s" : ""}
              </Typography>
            </div>
          </div>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalNuevo(true)}
            sx={{
              bgcolor:       "#2563EB",
              borderRadius:  "10px",
              px:            2.5,
              py:            1.2,
              fontWeight:    500,
              fontSize:      "13px",
              boxShadow:     "none",
              textTransform: "none",
              "&:hover":     { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            Nuevo curso
          </Button>
        </div>

        

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {/* ── Empty state ── */}
        {!isLoading && cursos.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <MenuBookIcon sx={{ fontSize: 32, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">No hay cursos registrados</p>
            <p className="text-[13px] text-[#94A3B8]">Crea tu primer curso con el botón "Nuevo curso"</p>
          </div>
        )}

        {/* ── Grid de cards ── */}
        {!isLoading && cursos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso, index) => (
              <MongoCursoCard
                key={curso._id}
                curso={curso}
                index={index}
                onEditar={(c)   => setModalEditar(c)}
                onEliminar={(c) => setModalEliminar(c)}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Modales ── */}
      {modalNuevo    && <ModalNuevoCurso    onClose={() => setModalNuevo(false)} />}
      {modalEditar   && <ModalEditarCurso   curso={modalEditar}   onClose={() => setModalEditar(null)} />}
      {modalEliminar && <ModalEliminarCurso curso={modalEliminar} onClose={() => setModalEliminar(null)} />}
    </div>
  );
};

export default Inicio;