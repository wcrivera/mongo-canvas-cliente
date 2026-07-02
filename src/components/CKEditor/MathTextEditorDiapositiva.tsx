// src/components/CKEditor/MathTextEditorDiapositiva.tsx
//
// Wrapper sobre MathTextEditor que activa el modo slide: escala el área
// editable a `porcentaje` * tamaño de slide. Toda la lógica vive en
// MathTextEditor; aquí solo se fija el modo slide y su porcentaje por defecto.

import MathTextEditor from "./MathTextEditor";

interface Props {
  initialData?: string;
  onChange?: (data: string) => void;
  siglaCurso?: string;
  tema?: string;
  porcentaje?: number;
}

const MathTextEditorDiapositiva: React.FC<Props> = (props) => (
  <MathTextEditor {...props} porcentaje={props.porcentaje ?? 0.6} />
);

export default MathTextEditorDiapositiva;
