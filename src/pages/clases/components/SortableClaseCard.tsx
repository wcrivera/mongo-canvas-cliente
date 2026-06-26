// src/pages/clases/components/SortableClaseCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { IClase } from "@/store/slices/clase";
import ClaseCard       from "./ClaseCard";

interface Props {
  clase:       IClase;
  capitulo_id: string;
  curso_id:    string;
  index:       number;
}

const SortableClaseCard = ({ clase, capitulo_id, curso_id, index }: Props) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: clase._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex:    isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ClaseCard
        index={index}
        clase={clase}
        capitulo_id={capitulo_id}
        curso_id={curso_id}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableClaseCard;