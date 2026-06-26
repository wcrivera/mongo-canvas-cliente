// src/pages/ejercicios/Ejercicios.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Typography, CircularProgress, Alert } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { cambiarPositionEjercicioQuiz, obtenerEjercicios, obtenerPreguntas } from "@/store/slices/quiz";
import type { IQuiz } from "@/store/slices/quiz";
import { obtenerMongoCurso } from "@/store/slices/mongoCurso";
import { obtenerCapitulos } from "@/store/slices/capitulo";
import ModalCrearQuiz from "../clases/components/ModalCrearQuiz";
import Header from "./components/Header";
import {
  closestCenter,
  DndContext,
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
import SortableEjercicioCard from "./components/SortableEjercicioCard";

const Ejercicios = () => {
  const { curso_id, capitulo_id } = useParams<{
    curso_id: string;
    capitulo_id: string;
  }>();
  const dispatch = useAppDispatch();

  const { quizzes, preguntas, isLoading, error } = useAppSelector(
    (s) => s.quizMongo,
  );
  const { capitulos } = useAppSelector((s) => s.capituloMongo);

  const ejercicios: IQuiz[] = quizzes
    .filter((q) => q.contexto === "ejercicio" && q.capitulo_id === capitulo_id)
    .sort((a, b) => a.position - b.position);

  const capituloActivo = capitulos.find((c) => c._id === capitulo_id);

  const [modalQuiz, setModalQuiz] = useState(false);
  const [quizEditar, setQuizEditar] = useState<IQuiz | undefined>(undefined);
  const [msgDeploy, setMsgDeploy] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!curso_id || !capitulo_id) return;
    dispatch(obtenerMongoCurso({ curso_id }));
    dispatch(obtenerCapitulos({ curso_id }));
    dispatch(obtenerEjercicios({ capitulo_id }));
  }, [curso_id, capitulo_id, dispatch]);

  const ejIds = ejercicios.map((e) => e._id).join(",");
  useEffect(() => {
    if (!ejIds) return;
    ejIds.split(",").forEach((quiz_id) => {
      dispatch(obtenerPreguntas({ quiz_id }));
    });
  }, [ejIds, dispatch]);

  const handleCreado = (quiz: IQuiz) => {
    setModalQuiz(false);
    setQuizEditar(undefined);
    // Cargar preguntas del nuevo ejercicio inmediatamente
    dispatch(obtenerPreguntas({ quiz_id: quiz._id }));
  };

  const preguntasEjercicio = (quiz_id: string) =>
    preguntas
      .filter((p) => p.quiz_id === quiz_id)
      .sort((a, b) => a.position - b.position);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ejercicios.findIndex((a) => a._id === active.id);
    const newIndex = ejercicios.findIndex((a) => a._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const direction = newIndex < oldIndex ? "up" : "down";
    const steps = Math.abs(newIndex - oldIndex);
    for (let i = 0; i < steps; i++) {
      await dispatch(
        cambiarPositionEjercicioQuiz({
          quiz_id: String(active.id),
          direction,
        }),
      );
    }
  };

  const ejercicioIds = ejercicios.map((e) => e._id);

  return (
    <div className="px-8 py-6 min-h-screen bg-[#F4F5F7]">
      <Header
        curso_id={curso_id!}
        capitulo={capituloActivo!}
        setMsgDeploy={setMsgDeploy}
      />

      <div className="py-4">
        {/* Botón agregar */}
        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setModalQuiz(true)}
            variant="outlined"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: "8px",
              px: 2,
              py: 0.85,
              fontSize: "13px",
              fontWeight: 500,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Agregar ejercicio
          </Button>
        </div>

        {/* Mensajes */}
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

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <CircularProgress sx={{ color: "#2563EB" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && ejercicios.length === 0 && !error && (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center">
              <EditNoteIcon sx={{ fontSize: 28, color: "#93C5FD" }} />
            </div>
            <Typography
              variant="body1"
              sx={{ color: "#64748B", fontWeight: 500 }}
            >
              No hay ejercicios
            </Typography>
            <Typography variant="body2" sx={{ color: "#94A3B8" }}>
              Crea el primero con "Agregar ejercicio"
            </Typography>
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
              items={ejercicioIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {ejercicios.map((ej, index) => {
                  const pqs = preguntasEjercicio(ej._id);
                  return (
                    <SortableEjercicioCard
                      key={ej._id}
                      ejercicio={ej}
                      preguntas={pqs}
                      index={index}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Modal crear/editar quiz */}
        {modalQuiz && capitulo_id && curso_id && (
          <ModalCrearQuiz
            contexto="ejercicio"
            capitulo_id={capitulo_id}
            curso_id={curso_id}
            quiz={quizEditar}
            onClose={() => {
              setModalQuiz(false);
              setQuizEditar(undefined);
            }}
            onCreado={handleCreado}
          />
        )}
      </div>
    </div>
  );
};

export default Ejercicios;
