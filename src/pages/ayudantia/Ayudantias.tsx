// src/pages/ayudantia/Ayudantias.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { obtenerMongoCurso } from "@/store/slices/mongoCurso";
import { obtenerCapituloActivo } from "@/store/slices/capitulo";
import {
  obtenerAyudantiasPorCapitulo,
  limpiarAyudantias,
  cambiarPositionAyudantia,
} from "@/store/slices/ayudantia";
import {
  obtenerSolucionesPorCapitulo,
  limpiarSoluciones,
} from "@/store/slices/solucionTexto";
import {
  obtenerVideosPorCapitulo,
  limpiarVideos,
} from "@/store/slices/video";
import {
  obtenerQuizzesPorCapitulo,
  limpiarQuizzes,
} from "@/store/slices/quiz";
import SortableAyudantiaCard from "./components/SortableAyudantiaCard";
import Header from "./components/Header";
import ModalCrearAyudantia from "./components/ModalCrearAyudantia";
import { chapter } from "@/db/db";

// ── Componente ────────────────────────────────────────────────────────────────
const Ayudantias = () => {
  const { curso_id, capitulo_id } = useParams<{
    curso_id: string;
    capitulo_id: string;
  }>();
  const dispatch = useAppDispatch();

  const { capituloActivo } = useAppSelector((s) => s.capituloMongo);
  const { ayudantias, isLoading, error } = useAppSelector(
    (s) => s.ayudantiaMongo,
  );

  const [mostrarForm, setMostrarForm] = useState(false);
  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapituloActivo({ capitulo_id }));
    dispatch(obtenerAyudantiasPorCapitulo({ capitulo_id }));
    dispatch(obtenerSolucionesPorCapitulo({ capitulo_id }));
    dispatch(obtenerVideosPorCapitulo({ capitulo_id }));
    dispatch(obtenerQuizzesPorCapitulo({ capitulo_id }));
    return () => {
      dispatch(limpiarAyudantias());
      dispatch(limpiarSoluciones());
      dispatch(limpiarVideos());
      dispatch(limpiarQuizzes());
    };
  }, [curso_id, capitulo_id, dispatch]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ayudantias.findIndex((a) => a._id === active.id);
    const newIndex = ayudantias.findIndex((a) => a._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionAyudantia({
          ayudantia_id: String(active.id),
          direction,
        }),
      );
    }
  };

  const ayudantiaIds = ayudantias.map((a) => a._id);

  return (
    <div className="px-8 py-6 min-h-screen bg-[#F4F5F7]">
      <Header
        curso_id={curso_id!}
        capitulo={capituloActivo!}
        setMsgDeploy={setMsgDeploy}
      />

      {mostrarForm && (
        <ModalCrearAyudantia
          capitulo_id={capitulo_id!}
          onClose={() => setMostrarForm(false)}
        />
      )}

      <div className="flex justify-end my-4">
        <Button
          sx={{ borderRadius: "10px", textTransform: "none" }}
          onClick={() => setMostrarForm(true)}
          size="medium"
          variant="outlined"
          startIcon={<AddIcon />}
        >
          Agregar ayudantía
        </Button>
      </div>

      {/* ── Contenido ── */}
      <div className="py-4">
        {msgDeploy && (
          <Alert
            severity={msgDeploy.startsWith("✓") ? "success" : "warning"}
            onClose={() => setMsgDeploy(null)}
            sx={{ mb: 4, borderRadius: "10px" }}
          >
            {msgDeploy}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && ayudantias.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <GroupsIcon sx={{ fontSize: 28, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">
              No hay ayudantías en este {chapter.name}
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Crea la primera con el botón de abajo
            </p>
          </div>
        )}

        {/* Lista con DnD */}
        {!isLoading && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={ayudantiaIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {ayudantias.map((ay, index) => (
                  <SortableAyudantiaCard
                    key={ay._id}
                    ayudantia={ay}
                    curso_id={curso_id!}
                    capitulo_id={capitulo_id!}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Ayudantias;
