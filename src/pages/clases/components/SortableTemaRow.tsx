// src/pages/clases/components/SortableTemaRow.tsx
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { ITema }  from "../../../store/slices/tema";
import TemaRow         from "./TemaRow";

interface Props {
  tema:        ITema;
  capitulo_id: string;
  indexClase:  number;
  indexTema:   number;
}

const SortableTemaRow = ({ tema, capitulo_id, indexClase, indexTema }: Props) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: tema._id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:   isDragging ? 0.5 : 1,
    zIndex:    isDragging ? 10 : "auto",
    
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TemaRow
        tema={tema}
        capitulo_id={capitulo_id}
        indexClase={indexClase}
        indexTema={indexTema}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

export default SortableTemaRow;