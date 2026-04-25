import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Dialog, DialogContent } from '@mui/material'
import katex from 'katex'
import Latex from 'react-latex-next'
import { KATEX_MACROS } from './katexMacros'

interface MathEditModalProps {
  latex: string
  type: 'inline' | 'block'
  onSave: (latex: string, type: 'inline' | 'block') => void
  onClose: () => void
}

const SNIPPETS = [
  { label: '\\(\\dfrac{a}{b}\\)',                                          code: '\\frac{a}{b}' },
  { label: '\\(\\sqrt{x}\\)',                                              code: '\\sqrt{x}' },
  { label: '\\(x^{n}\\)',                                                  code: 'x^{n}' },
  { label: '\\(x_{n}\\)',                                                  code: 'x_{n}' },
  { label: '\\(\\displaystyle \\int_{a}^{b} f(x)\\,dx\\)',                code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: '\\(\\displaystyle \\sum_{n=1}^{\\infty} a_n\\)',              code: '\\sum_{n=1}^{\\infty} a_n' },
  { label: '\\(\\displaystyle \\lim_{x \\to \\infty}\\)',                 code: '\\lim_{x \\to \\infty}' },
  { label: "\\(f'(x)\\)",                                                  code: "f'(x)" },
  { label: '\\(\\dfrac{\\partial f}{\\partial x}\\)',                     code: '\\frac{\\partial f}{\\partial x}' },
  { label: '\\(\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\\)',      code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '\\(\\begin{cases} f(x) \\\\ g(x) \\end{cases}\\)',           code: '\\begin{cases} f(x) \\\\ g(x) \\end{cases}' },
  { label: '\\(\\displaystyle \\binom{n}{k}\\)',                          code: '\\binom{n}{k}' },
  { label: '\\(\\mathbb{N}\\)',                                            code: '\\mathbb{N}' },
  { label: '\\(\\mathbb{Z}\\)',                                            code: '\\mathbb{Z}' },
  { label: '\\(\\mathbb{Q}\\)',                                            code: '\\mathbb{Q}' },
  { label: '\\(\\mathbb{R}\\)',                                            code: '\\mathbb{R}' },
  { label: '\\(\\alpha\\)',                                                code: '\\alpha' },
  { label: '\\(\\beta\\)',                                                 code: '\\beta' },
  { label: '\\(\\gamma\\)',                                                code: '\\gamma' },
  { label: '\\(\\delta\\)',                                                code: '\\delta' },
  { label: '\\(\\theta\\)',                                                code: '\\theta' },
  { label: '\\(\\phi\\)',                                                  code: '\\phi' },
  { label: '\\(\\lambda\\)',                                               code: '\\lambda' },
  { label: '\\(\\mu\\)',                                                   code: '\\mu' },
  { label: '\\(\\sigma\\)',                                                code: '\\sigma' },
  { label: '\\(\\to\\)',                                                   code: '\\to ' },
  { label: '\\(\\iff\\)',                                                  code: '\\iff' },
  { label: '\\(\\forall\\)',                                               code: '\\forall' },
  { label: '\\(\\exists\\)',                                               code: '\\exists' },
]

export function MathEditModal({ latex, type: initialType, onSave, onClose }: MathEditModalProps) {
  const [value, setValue]   = useState(latex)
  const [type,  setType]    = useState<'inline' | 'block'>(initialType)
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 80)
  }, [])

  // Preview con KaTeX directo para mostrar errores en tiempo real
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
    const s   = ta.selectionStart
    const end = ta.selectionEnd
    setValue(prev => prev.slice(0, s) + code + prev.slice(end))
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + code.length }, 0)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onSave(value, type) }
    if (e.key === 'Escape') onClose()
  }

  const kbdStyle: React.CSSProperties = {
    background: '#eef3f8', border: '1px solid #c9dae8', borderRadius: 4,
    padding: '1px 5px', fontSize: 10, color: '#6793ba', fontFamily: 'sans-serif',
  }

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
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: '#4A6D8C',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: 14, fontFamily: 'Georgia, serif' }}>
            Editor LaTeX
          </span>
          {/* Switch inline / bloque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: type === 'inline' ? 'white' : 'rgba(255,255,255,0.5)', fontSize: 12, transition: 'color 0.2s' }}>
              Inline
            </span>
            <div
              onClick={() => setType(t => t === 'inline' ? 'block' : 'inline')}
              style={{
                width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                background: type === 'block' ? 'white' : 'rgba(255,255,255,0.3)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2,
                left: type === 'block' ? 18 : 2,
                width: 16, height: 16, borderRadius: '50%',
                background: type === 'block' ? '#4A6D8C' : 'white',
                transition: 'left 0.2s, background 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ color: type === 'block' ? 'white' : 'rgba(255,255,255,0.5)', fontSize: 12, transition: 'color 0.2s' }}>
              Bloque
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.15)', color: 'white',
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>
      </div>

      {/* ── Snippets ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 5,
        padding: '10px 18px', background: '#f7f9fc',
        borderBottom: '1px solid #e4edf5',
      }}>
        {SNIPPETS.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => insertSnippet(s.code)}
            title={s.code}
            style={{
              border: '1px solid #c9dae8', background: 'white', borderRadius: 5,
              padding: '3px 9px', fontSize: 11, color: '#3c5770',
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'Georgia, serif', transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#daeaf6';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#4A6D8C';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'white';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#c9dae8';
            }}
          >
            <Latex macros={KATEX_MACROS}>{s.label}</Latex>
          </button>
        ))}
      </div>

      {/* ── Body: editor + preview ── */}
      <DialogContent sx={{ p: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 200 }}>

          {/* LaTeX */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 18px', borderRight: '1px solid #e4edf5' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8daecb', marginBottom: 8 }}>
              LaTeX
            </span>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKey}
              rows={6}
              spellCheck={false}
              placeholder="\frac{a}{b} + \sqrt{x^2 + 1}"
              style={{
                flex: 1, resize: 'vertical',
                fontFamily: "'Fira Code', Consolas, monospace",
                fontSize: 13, lineHeight: 1.6, color: '#1f2c38',
                border: '1.5px solid #d9e4ee', borderRadius: 8,
                padding: '10px 12px', outline: 'none',
                background: '#f9fbfd', minHeight: 130,
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#4A6D8C'; e.currentTarget.style.background = 'white'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = '#d9e4ee'; e.currentTarget.style.background = '#f9fbfd'; }}
            />
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 18px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8daecb', marginBottom: 8 }}>
              Preview
            </span>
            <div style={{
              flex: 1, border: '1.5px solid #d9e4ee', borderRadius: 8,
              padding: '12px 16px', background: '#f9fbfd',
              display: 'flex', alignItems: type === 'block' ? 'center' : 'flex-start',
              justifyContent: type === 'block' ? 'center' : 'flex-start',
              minHeight: 130, overflow: 'auto',
            }}>
              {error ? (
                <p style={{ color: '#e74c3c', fontFamily: 'monospace', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
                  {error}
                </p>
              ) : preview ? (
                <div
                  dangerouslySetInnerHTML={{ __html: preview }}
                  style={{ fontSize: type === 'block' ? 18 : 15, width: '100%', textAlign: type === 'block' ? 'center' : 'left' }}
                />
              ) : (
                <p style={{ color: '#8daecb', fontSize: 12, fontStyle: 'italic', textAlign: 'center' }}>
                  Escribe LaTeX para ver el preview…
                </p>
              )}
            </div>
          </div>

        </div>
      </DialogContent>

      {/* ── Footer ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', background: '#f7f9fc', borderTop: '1px solid #e4edf5',
      }}>
        <p style={{ fontSize: 11, color: '#8daecb', margin: 0 }}>
          <kbd style={kbdStyle}>Ctrl</kbd> + <kbd style={kbdStyle}>↵</kbd> guardar ·{' '}
          <kbd style={kbdStyle}>Esc</kbd> cancelar
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              border: '1px solid #d9e4ee', background: 'white', borderRadius: 8,
              padding: '6px 16px', fontSize: 13, color: '#6793ba', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(value, type)}
            disabled={!!error}
            style={{
              background: '#4A6D8C', border: 'none', borderRadius: 8,
              padding: '6px 16px', fontSize: 13, fontWeight: 600,
              color: 'white', cursor: 'pointer',
              opacity: error ? 0.4 : 1,
            }}
          >
            Insertar fórmula
          </button>
        </div>
      </div>
    </Dialog>
  )
}