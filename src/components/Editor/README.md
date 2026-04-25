# Actualización del Editor — Instrucciones

## 1. Instalar nuevas dependencias

```bash
npm install \
  @tiptap/extension-underline \
  @tiptap/extension-text-align \
  @tiptap/extension-link \
  @tiptap/extension-highlight \
  @tiptap/extension-table \
  @tiptap/extension-table-row \
  @tiptap/extension-table-cell \
  @tiptap/extension-table-header
```

## 2. Reemplazar archivos en src/components/Editor/

Copiar los 6 archivos nuevos:
- LatexEditor.tsx
- LatexEditor.module.css
- Toolbar.tsx
- Toolbar.module.css
- MathEditModal.tsx
- MathEditModal.module.css
- index.ts

## 3. Usar toCanvasHTML al hacer deploy

En `generarHtmlEjercicios.ts` (y cualquier función de deploy), importar y aplicar:

```ts
import { toCanvasHTML } from '../../components/Editor'

// Dentro de la función que genera el HTML de cada ejercicio:
const enunciadoCanvas = toCanvasHTML(ej.enunciado)

// Usar enunciadoCanvas en lugar de ej.enunciado en el template HTML
```

## 4. Integrar en FormEjercicio (reemplazar textarea)

```tsx
import { LatexEditor } from '../../components/Editor'

// Reemplazar el bloque textarea+preview por:
<LatexEditor
  initialContent={form.enunciado}
  onChange={(html) => setForm(f => ({ ...f, enunciado: html }))}
  placeholder="Escribe el enunciado... usa $$ para LaTeX"
  minHeight="160px"
/>
```

## 5. Nuevas capacidades del editor

| Herramienta | Descripción |
|---|---|
| H1 / H2 / H3 | Encabezados con estilos tipográficos |
| **B** *I* _U_ ~~S~~ | Negrita, itálica, subrayado, tachado |
| Resaltado | Texto con fondo amarillo |
| Alineación L/C/R | Alineación de párrafos |
| Listas y blockquote | Viñetas, numerada, cita |
| Bloque de código | Con fuente monoespaciada |
| Enlace | Insertar/quitar URL |
| Tabla | 3×3 con encabezado editable |
| f(x) | Fórmula inline (abre modal) |
| ∑∫∂ | Bloque matemático centrado (abre modal) |
| ⛶ | Pantalla completa |

## 6. Sobre Canvas y LaTeX

Canvas LMS incluye MathJax y reconoce automáticamente:
- `\( ... \)` → fórmula inline
- `\[ ... \]` → bloque matemático

La función `toCanvasHTML()` convierte el HTML interno de Tiptap
(que usa nodos custom) al formato de texto plano que Canvas entiende.