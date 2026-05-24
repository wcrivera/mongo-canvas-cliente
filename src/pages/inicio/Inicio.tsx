// src/pages/inicio/Inicio.tsx
import { useEffect, useState } from "react";
import { CircularProgress, Alert } from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  obtenerMongoCursos,
  type IMongoCurso,
} from "../../store/slices/mongoCurso";
import MongoCursoCard from "./components/MongoCursoCard";

import CrearCurso from "./components/CrearCurso";
import Header from "./components/Header";
import EditarCurso from "./components/EditarCurso";
import EliminarCurso from "./components/EliminarCurso";

const Inicio = () => {
  const dispatch = useAppDispatch();
  const { cursos, isLoading, error } = useAppSelector((s) => s.mongoCurso);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState<IMongoCurso | null>(null);
  const [modalEliminar, setModalEliminar] = useState<IMongoCurso | null>(null);

  useEffect(() => {
    dispatch(obtenerMongoCursos());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="p-6">
        {/* ── Header ── */}
        <Header cursos={cursos} setModalNuevo={setModalNuevo} />

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
            <p className="text-[15px] font-medium text-[#64748B]">
              No hay cursos registrados
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Crea tu primer curso con el botón "Nuevo curso"
            </p>
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
                onEditar={(c) => setModalEditar(c)}
                onEliminar={(c) => setModalEliminar(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modales ── */}

      {modalNuevo && <CrearCurso onClose={() => setModalNuevo(false)} />}

      {modalEditar && (
        <EditarCurso curso={modalEditar} onClose={() => setModalEditar(null)} />
      )}

      {modalEliminar && (
        <EliminarCurso
          curso={modalEliminar}
          onClose={() => setModalEliminar(null)}
        />
      )}
    </div>
  );
};

export default Inicio;
