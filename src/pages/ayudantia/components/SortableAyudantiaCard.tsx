// src/pages/ayudantia/components/SortableAyudantiaCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { IAyudantia } from "@/store/slices/ayudantia";
import AyudantiaCard   from "./AyudantiaCard";

interface Props {
  ayudantia:   IAyudantia;
  curso_id:    string;
  capitulo_id: string;
  index: number;
}

const SortableAyudantiaCard = ({ ayudantia, curso_id, capitulo_id, index }: Props) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: ayudantia._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex:    isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AyudantiaCard
        index={index}
        ayudantia={ayudantia}
        curso_id={curso_id}
        capitulo_id={capitulo_id}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableAyudantiaCard;