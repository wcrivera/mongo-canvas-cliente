// src/pages/capitulo/Capitulos.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Alert, Button } from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import AddIcon from "@mui/icons-material/Add";

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
import {
  obtenerCapitulos,
  limpiarCapitulos,
  cambiarPositionCapitulo,
} from "@/store/slices/capitulo";
import { obtenerClasesPorCurso, limpiarClases } from "@/store/slices/clase";
import { obtenerTemasPorCurso, limpiarTemas } from "@/store/slices/tema";
import { obtenerMongoCurso } from "@/store/slices/mongoCurso";
import SortableCapituloCard from "./components/SortableCapituloCard";
import ModalCrearCapitulo from "./components/ModalCrearCapitulo";
import Header from "./components/Header";
import { chapter } from "@/db/db";

const Capitulos = () => {
  const { curso_id } = useParams<{ curso_id: string }>();
  const dispatch = useAppDispatch();

  const { capitulos, isLoading, error } = useAppSelector(
    (s) => s.capituloMongo,
  );

  const [mostrarInline, setMostrarInline] = useState(false);

  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!curso_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerClasesPorCurso({ curso_id }));
    dispatch(obtenerTemasPorCurso({ curso_id }));
    return () => {
      dispatch(limpiarCapitulos());
      dispatch(limpiarClases());
      dispatch(limpiarTemas());
    };
  }, [curso_id, dispatch]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = capitulos.findIndex((c) => c._id === active.id);
    const newIndex = capitulos.findIndex((c) => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionCapitulo({ capitulo_id: String(active.id), direction }),
      );
    }
  };

  const capituloCIds = capitulos.map((c) => c._id);

  return (
    <div className="px-8 py-6 min-h-screen bg-[#F4F5F7]">
      <Header
        curso_id={curso_id!}
        setMsgDeploy={setMsgDeploy}
        capitulos={capitulos}
        isLoading={isLoading}
      />

      {mostrarInline && (
        <ModalCrearCapitulo
          curso_id={curso_id!}
          onClose={() => setMostrarInline(false)}
        />
      )}

      <div className="flex justify-end my-4">
        <Button
          sx={{borderRadius: "10px", textTransform: "none"}}
          onClick={() => setMostrarInline(true)}
          size="medium"
          variant="outlined"
          startIcon={<AddIcon />}
        >
          Agregar {chapter.name}
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
        {!isLoading && capitulos.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <LayersIcon sx={{ fontSize: 28, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">
              No hay capítulos
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Agrega el primero con el botón
            </p>
          </div>
        )}

        {/* Drag & drop */}
        {!isLoading && capitulos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={capituloCIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {capitulos.map((cap, index) => (
                  <SortableCapituloCard
                    key={cap._id}
                    curso_id={curso_id!}
                    capitulo={cap}
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

export default Capitulos;
