// src/pages/clases/Clases.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClassIcon from "@mui/icons-material/Class";

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

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { obtenerMongoCurso } from "../../store/slices/mongoCurso";
import { obtenerCapituloActivo } from "../../store/slices/capitulo";
import {
  obtenerClasesPorCapitulo,
  limpiarClases,
  cambiarPositionClase,
} from "../../store/slices/clase";
import { obtenerTemasPorCapitulo, limpiarTemas } from "../../store/slices/tema";
import {
  obtenerDiapositivasPorCapitulo,
  limpiarDiapositivas,
} from "../../store/slices/diapositiva";
import {
  obtenerVideosPorCapitulo,
  limpiarVideos,
} from "../../store/slices/video";
import {
  obtenerQuizzesPorCapitulo,
  limpiarQuizzes,
} from "../../store/slices/quiz";
import SortableClaseCard from "./components/SortableClaseCard";
import Header from "./components/Header";
import ModalCrearClase from "./components/ModalCrearClase";

// ── Componente ────────────────────────────────────────────────────────────────
const Clases = () => {
  const { curso_id, capitulo_id } = useParams<{
    curso_id: string;
    capitulo_id: string;
  }>();

  const dispatch = useAppDispatch();

  const { capituloActivo } = useAppSelector((s) => s.capituloMongo);
  const { clases, isLoading, error } = useAppSelector((s) => s.claseMongo);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapituloActivo({ capitulo_id }));
    dispatch(obtenerClasesPorCapitulo({ capitulo_id }));
    dispatch(obtenerTemasPorCapitulo({ capitulo_id }));
    dispatch(obtenerDiapositivasPorCapitulo({ capitulo_id }));
    dispatch(obtenerVideosPorCapitulo({ capitulo_id }));
    dispatch(obtenerQuizzesPorCapitulo({ capitulo_id }));
    return () => {
      dispatch(limpiarClases());
      dispatch(limpiarTemas());
      dispatch(limpiarDiapositivas());
      dispatch(limpiarVideos());
      dispatch(limpiarQuizzes());
    };
  }, [curso_id, capitulo_id, dispatch]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = clases.findIndex((c) => c._id === active.id);
    const newIndex = clases.findIndex((c) => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionClase({ clase_id: String(active.id), direction }),
      );
    }
  };

  const claseIds = clases.map((c) => c._id);

  return (
    <div className="px-8 py-6 min-h-screen bg-[#F4F5F7]">
      <Header
        curso_id={curso_id!}
        capitulo={capituloActivo!}
        setMsgDeploy={setMsgDeploy}
      />

      {mostrarForm && (
        <ModalCrearClase
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
          Agregar clase
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
        {!isLoading && clases.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <ClassIcon sx={{ fontSize: 28, color: "#93C5FD" }} />
            </div>
            <p className="text-[15px] font-medium text-[#64748B]">
              No hay clases en este capítulo
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Crea la primera con el botón
            </p>
          </div>
        )}

        {/* Lista con DnD */}
        {!isLoading && (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={claseIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {clases.map((clase, index) => (
                    <SortableClaseCard
                      key={clase._id}
                      index={index}
                      clase={clase}
                      capitulo_id={capitulo_id!}
                      curso_id={curso_id!}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
};

export default Clases;
