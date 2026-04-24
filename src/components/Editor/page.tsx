'use client'

import { useState } from 'react'
import { LatexEditor } from './LatexEditor'

export default function Page() {
  const [html, setHtml] = useState('')

  return (
    <main style={{ maxWidth: 860, margin: '3rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', marginBottom: '1.5rem', fontSize: '1.75rem' }}>
        Editor LaTeX
      </h1>
      <LatexEditor
        onChange={setHtml}
        placeholder="Empieza a escribir... Usa $$ para insertar fórmulas."
      />

      {/* Opcional: mostrar el HTML generado */}
      {html && (
        <details style={{ marginTop: '2rem' }}>
          <summary style={{ cursor: 'pointer', color: '#666', fontSize: '13px' }}>
            Ver HTML generado
          </summary>
          <pre
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '12px',
              overflowX: 'auto',
              fontFamily: 'monospace',
            }}
          >
            {html}
          </pre>
        </details>
      )}
    </main>
  )
}
