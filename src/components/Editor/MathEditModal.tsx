import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import katex from 'katex'
import Latex from 'react-latex-next'

interface MathEditModalProps {
  latex: string
  type: 'inline' | 'block'
  onSave: (latex: string) => void
  onClose: () => void
}

const SNIPPETS = [
  { label: '\\(\\dfrac{a}{b}\\)',      code: '\\frac{a}{b}' },
  { label: '\\(\\sqrt{x}\\)',         code: '\\sqrt{x}' },
  { label: '\\(x^{n}\\)',     code: 'x^{n}' },
  { label: '\\(x_{n}\\)',    code: 'x_{n}' },
  { label: '\\(\\displaystyle \\int_{a}^{b} f(x)\\,dx\\)',     code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: '\\(\\displaystyle \\sum_{n=1}^{\\infty} a_n\\)',       code: '\\sum_{n=1}^{\\infty} a_n' },
  { label: '\\(\\displaystyle \\lim_{x \\to \\infty}\\)',       code: '\\lim_{x \\to \\infty}' },
  { label: "\\(f'(x)\\)",         code: "f'(x)" },
  { label: '\\(\\dfrac{\\partial f}{\\partial x}\\)',    code: '\\frac{\\partial f}{\\partial x}' },
  { label: '\\(\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\)',   code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '\\(\\begin{cases} f(x) \\\\ g(x) \\end{cases}\\)',      code: '\\begin{cases} f(x) \\\\ g(x) \\end{cases}' },
  { label: '\\(\\displaystyle \\binom{n}{k}\\)',     code: '\\binom{n}{k}' },
  { label: '\\(\\mathbb{N}\\)',       code: '\\mathbb{N}' },
  { label: '\\(\\mathbb{Z}\\)',       code: '\\mathbb{Z}' },
  { label: '\\(\\mathbb{Q}\\)',       code: '\\mathbb{Q}' },
  { label: '\\(\\mathbb{R}\\)',       code: '\\mathbb{R}' },
  { label: '\\(\\alpha\\)',      code: '\\alpha' },
  { label: '\\(\\beta\\)',      code: '\\beta' },
  { label: '\\(\\gamma\\)',      code: '\\gamma' },
  { label: '\\(\\delta\\)',      code: '\\delta' },
  { label: '\\(\\theta\\)',    code: '\\theta' },
  { label: '\\(\\phi\\)',    code: '\\phi' },
  { label: '\\(\\lambda\\)',    code: '\\lambda' },
  { label: '\\(\\mu\\)',    code: '\\mu' },
  { label: '\\(\\sigma\\)',    code: '\\sigma' },
  { label: '\\(\\to \\)',     code: '\\to ' },
  { label: '\\(\\to\\)',     code: '\\to' },
  { label: '\\(\\iff\\)',     code: '\\iff' },
  { label: '\\(\\forall\\)',     code: '\\forall' },
  { label: '\\(\\exists\\)',     code: '\\exists' },
]

const KATEX_MACROS = {
  '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}',
  '\\C': '\\mathbb{C}', '\\E': '\\mathbb{E}',
}

export function MathEditModal({ latex, type, onSave, onClose }: MathEditModalProps) {
  const [value, setValue] = useState(latex)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80)
  }, [])

  // useMemo en lugar de useEffect + setState para el preview — evita el render extra
  const { preview, error } = useMemo(() => {
    if (!value.trim()) return { preview: '', error: '' }
    try {
      return {
        preview: katex.renderToString(value, {
          throwOnError: true,
          displayMode: type === 'block',
          macros: KATEX_MACROS,
        }),
        error: '',
      }
    } catch (e) {
      const msg = e instanceof Error
        ? e.message.replace(/^KaTeX parse error: /, '')
        : 'Error de sintaxis'
      return { preview: '', error: msg }
    }
  }, [value, type])

  const insertSnippet = useCallback((code: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const s = ta.selectionStart
    const end = ta.selectionEnd
    setValue(prev => prev.slice(0, s) + code + prev.slice(end))
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + code.length }, 0)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onSave(value) }
    if (e.key === 'Escape') onClose()
  }

  const kbdCls = 'bg-chapter-100 border border-chapter-200 rounded px-1.5 py-0.5 text-[10px] text-chapter-500 font-sans'

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,30,60,0.2)' }
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-chapter-500">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 text-white px-2.5 py-0.5 rounded-full">
            {type === 'block' ? 'Bloque' : 'Inline'}
          </span>
          <span className="text-[14px] font-semibold text-white font-serif tracking-wide">
            Editor LaTeX
          </span>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/15 border-none text-white cursor-pointer flex items-center justify-center text-sm hover:bg-white/25 transition-colors">
          ✕
        </button>
      </div>

      {/* Snippets */}
      <div className="flex flex-wrap gap-1.5 px-5 py-3 bg-chapter-50 border-b border-chapter-100">
        {SNIPPETS.map(s => (
          <button key={s.label} type="button"
            onClick={() => insertSnippet(s.code)}
            title={s.code}
            className="border border-chapter-200 bg-white rounded-md px-2.5 py-1 text-[11px] text-chapter-700 font-serif cursor-pointer hover:bg-chapter-100 hover:border-chapter-400 transition-all">
            <Latex>{s.label}</Latex>
          </button>
        ))}
      </div>

      <DialogContent sx={{ p: 0 }}>
        <div className="grid grid-cols-2 divide-x divide-chapter-100 min-h-[200px]">
          {/* LaTeX */}
          <div className="flex flex-col p-4 gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-chapter-300">LaTeX</span>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKey}
              rows={6}
              spellCheck={false}
              placeholder="\frac{a}{b} + \sqrt{x^2 + 1}"
              className="flex-1 resize-y font-mono text-[13px] text-chapter-800 bg-chapter-50 border border-chapter-100 rounded-lg p-3 outline-none focus:border-chapter-400 focus:bg-white transition-colors min-h-[130px]"
            />
          </div>

          {/* Preview */}
          <div className="flex flex-col p-4 gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-chapter-300">Preview</span>
            <div className="flex-1 flex items-center justify-center border border-chapter-100 rounded-lg bg-chapter-50 p-4 min-h-[130px] overflow-auto">
              {error ? (
                <p className="text-red-500 font-mono text-[12px] text-center leading-relaxed">{error}</p>
              ) : preview ? (
                <div dangerouslySetInnerHTML={{ __html: preview }} />
              ) : (
                <p className="text-chapter-300 text-[12px] italic text-center">
                  Escribe LaTeX para ver el preview…
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 bg-chapter-50 border-t border-chapter-100">
        <p className="text-[11px] text-chapter-300">
          <kbd className={kbdCls}>Ctrl</kbd> + <kbd className={kbdCls}>↵</kbd> guardar ·{' '}
          <kbd className={kbdCls}>Esc</kbd> cancelar
        </p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="border border-chapter-200 bg-white rounded-lg px-4 py-1.5 text-[13px] text-chapter-400 cursor-pointer hover:border-chapter-400 hover:text-chapter-600 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onSave(value)} disabled={!!error}
            className="bg-chapter-500 border-none rounded-lg px-4 py-1.5 text-[13px] font-semibold text-white cursor-pointer hover:bg-chapter-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Insertar fórmula
          </button>
        </div>
      </div>
    </Dialog>
  )
}