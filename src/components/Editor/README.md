# Tiptap LaTeX Editor

Editor de texto enriquecido con soporte para LaTeX renderizado en tiempo real, construido sobre Tiptap + KaTeX.

## Características

- ✏️ Edición WYSIWYG — el LaTeX se renderiza directamente en el editor
- 🔢 LaTeX **inline** (`$$...$$`) y en **bloque** (botón de toolbar)
- 🖱️ Click en cualquier fórmula abre un modal de edición con **preview en tiempo real**
- 🧩 15 snippets rápidos (fracciones, integrales, matrices, griegos...)
- 🎨 Formato de texto: negrita, itálica, H1/H2/H3, listas
- ✅ Validación de sintaxis LaTeX con mensajes de error

## Instalación

```bash
npm install
# o
pnpm install
```

## Dependencias clave

```
@tiptap/react                   # Core del editor
@tiptap/starter-kit             # Bold, italic, headings, listas
@tiptap/extension-mathematics   # Nodos InlineMath y BlockMath
katex                           # Renderer LaTeX
```

## Uso

```tsx
import { LatexEditor } from '@/components'

<LatexEditor
  onChange={(html) => console.log(html)}
  placeholder="Escribe aquí..."
  initialContent="<p>Hola $E = mc^2$</p>"
/>
```

## Flujo de uso

| Acción | Resultado |
|--------|-----------|
| Escribir `$$x^2$$` + espacio | Se convierte en nodo LaTeX inline |
| Botón `$x$` en toolbar | Inserta nodo inline editable |
| Botón `$$` en toolbar | Inserta bloque matemático centrado |
| Click en cualquier fórmula | Abre modal con editor + preview |
| `⌘↵` en el modal | Guarda y cierra |

## Estructura de archivos

```
src/components/
├── LatexEditor.tsx         # Componente principal + configuración Tiptap
├── LatexEditor.module.css  # Estilos del editor y nodos math
├── Toolbar.tsx             # Barra de herramientas
├── Toolbar.module.css
├── MathEditModal.tsx       # Modal con editor LaTeX + preview KaTeX
├── MathEditModal.module.css
└── index.ts                # Barrel exports
```

## Personalización

### Añadir macros LaTeX

En `LatexEditor.tsx`, en `Mathematics.configure`:

```ts
katexOptions: {
  macros: {
    '\\R': '\\mathbb{R}',
    '\\E': '\\mathbb{E}', // Esperanza
    '\\norm': '\\|#1\\|', // Norma
  }
}
```

### Cambiar el trigger de inline math

Por defecto Tiptap usa `$$texto$$` para inline. Puedes cambiarlo en la configuración del nodo si prefieres un solo `$`.

## Notas

- El HTML generado por `editor.getHTML()` incluye los nodos math como elementos HTML personalizados — necesitarás re-renderizar con KaTeX en la vista de lectura.
- Para serializar a Markdown con LaTeX, considera `@tiptap/extension-markdown`.
