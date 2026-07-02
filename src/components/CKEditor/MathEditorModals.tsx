// src/components/CKEditor/MathEditorModals.tsx
//
// Render COMPARTIDO de los 4 modales de los editores CKEditor
// (imagen URL/galería, GeoGebra, fórmula LaTeX, subtítulo de entorno).
// Antes este bloque JSX estaba duplicado idéntico en cada editor.
//
// Uso:
//   const m = useMathModals();
//   ...
//   <MathEditorModals {...m} siglaCurso={siglaCurso} withGeoGebra />
//
// `withGeoGebra` controla si se renderiza el modal de GeoGebra (el Inline no
// lo usa). Recibe el objeto completo de useMathModals; los campos que no usa
// (editorRef, handlers de config, etc.) simplemente se ignoran.

import { InsertImageUrlModal } from "./components/InsertImageUrlModal";
import { GeoGebraModal } from "./components/GeoGebraModal";
import MathEditModal from "./components/MathEditModal";
import MathBlockModal from "./components/MathBlockModal";
import type { UseMathModals } from "./useMathModals";

type Props = UseMathModals & {
  siglaCurso?: string;
  withGeoGebra?: boolean;
};

const MathEditorModals = ({
  siglaCurso = "",
  withGeoGebra = false,
  latexModal,
  urlModal,
  envModal,
  geogebraOpen,
  handleImageUrlInsert,
  handleUrlModalClose,
  handleGeoGebraInsert,
  handleGeoGebraClose,
  handleLatexModalSave,
  handleLatexModalClose,
  handleEnvModalSave,
  handleEnvModalClose,
}: Props) => {
  return (
    <>
      {/* Modal: imagen por URL / galería */}
      {urlModal.open && (
        <InsertImageUrlModal
          siglaCurso={siglaCurso}
          initialTab={urlModal.tab ?? 0}
          onInsert={handleImageUrlInsert}
          onClose={handleUrlModalClose}
        />
      )}

      {/* Modal: GeoGebra (solo si el editor lo habilita) */}
      {withGeoGebra && geogebraOpen && (
        <GeoGebraModal
          onInsert={handleGeoGebraInsert}
          onClose={handleGeoGebraClose}
        />
      )}

      {/* Modal: fórmula LaTeX — onSave: (latex, type) => void */}
      {latexModal.open && (
        <MathEditModal
          latex={latexModal.latex}
          type={latexModal.type}
          onSave={handleLatexModalSave}
          onClose={handleLatexModalClose}
        />
      )}

      {/* Modal: subtítulo de entorno — onSave: (subtitulo) => void
          key fuerza remonte limpio al cambiar de tipo */}
      {envModal.open && (
        <MathBlockModal
          key={envModal.tipo}
          tipo={envModal.tipo}
          subtituloActual={envModal.subtituloActual}
          modoInsertar={envModal.modoInsertar}
          onSave={handleEnvModalSave}
          onClose={handleEnvModalClose}
        />
      )}
    </>
  );
};

export default MathEditorModals;