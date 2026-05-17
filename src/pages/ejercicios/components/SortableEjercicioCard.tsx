// src/pages/ejercicios/components/SortableEjercicioCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { IEjercicio } from "../../../store/slices/ejercicio";
import EjercicioCard   from "./EjercicioCard";

interface Props {
  ejercicio:   IEjercicio;
  curso_id:    string;
  capitulo_id: string;
}

const SortableEjercicioCard = ({ ejercicio, curso_id, capitulo_id }: Props) => {
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
        curso_id={curso_id}
        capitulo_id={capitulo_id}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableEjercicioCard;