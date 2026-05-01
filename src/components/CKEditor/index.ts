// src/components/CKEditor/index.ts
//
// Punto de entrada único para el editor CKEditor del proyecto.
// Todos los componentes deben importar desde aquí, no directamente
// desde los archivos internos.

export { default as MathTextEditor } from "./MathTextEditor";

// Alias para compatibilidad con código existente que usa CKEditorField
export { default as CKEditorField }  from "./MathTextEditor";
export { default as CKEditorMath }   from "./MathTextEditor";