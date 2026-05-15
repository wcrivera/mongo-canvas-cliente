// src/pages/capitulo/components/SortableCapituloCard.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { ICapitulo } from "../../../store/slices/capitulo";
import CapituloCard from "./CapituloCard";

interface Props {
  capitulo: ICapitulo;
  curso_id: string;
}

const SortableCapituloCard = ({ capitulo, curso_id }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: capitulo._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.5 : 1,
    zIndex:    isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CapituloCard
        capitulo={capitulo}
        curso_id={curso_id}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableCapituloCard;