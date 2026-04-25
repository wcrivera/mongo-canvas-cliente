import { useState } from 'react'
import { LatexEditor } from '../../components/Editor'
import { toCanvasHTML } from '../../components/Editor/canvasHTML'

export default function EditorTest() {
  const [html, setHtml] = useState('')

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-chapter-600 mb-6 font-serif">
        🧪 Editor LaTeX — prueba
      </h1>

      <LatexEditor
        onChange={setHtml}
        placeholder="Escribe aquí… usa \\( ... \\) para fórmulas inline y \\[ ... \\] para bloques"
        minHeight="240px"
      />

      {html && (
        <details className="mt-6">
          <summary className="text-sm text-chapter-400 cursor-pointer mb-2">
            Ver HTML interno (Tiptap)
          </summary>
          <pre className="bg-chapter-50 border border-chapter-100 rounded-lg p-4 text-xs overflow-x-auto text-chapter-700">
            {html}
          </pre>
          <summary className="text-sm text-chapter-400 cursor-pointer mt-4 mb-2">
            Ver HTML Canvas (toCanvasHTML)
          </summary>
          <pre className="bg-chapter-50 border border-chapter-100 rounded-lg p-4 text-xs overflow-x-auto text-chapter-700">
            {toCanvasHTML(html)}
          </pre>
        </details>
      )}
    </div>
  )
}