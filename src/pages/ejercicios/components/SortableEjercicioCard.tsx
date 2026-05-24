// src/pages/ejercicios/components/SortableEjercicioCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { IQuiz, IPregunta } from "../../../store/slices/quiz";
import EjercicioCard from "./EjercicioCard";

interface Props {
  ejercicio: IQuiz;
  preguntas: IPregunta[];
  index:     number;
}

const SortableEjercicioCard = ({ ejercicio, preguntas, index }: Props) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: ejercicio._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex:    isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EjercicioCard
        ejercicio={ejercicio}
        preguntas={preguntas}
        index={index}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableEjercicioCard;