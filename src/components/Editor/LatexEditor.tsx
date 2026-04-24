'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Mathematics } from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'
import { useState, useCallback } from 'react'
import { MathEditModal } from './MathEditModal'
import { Toolbar } from './Toolbar'
import styles from './LatexEditor.module.css'

interface LatexEditorProps {
  initialContent?: string
  placeholder?: string
  onChange?: (html: string) => void
}

export function LatexEditor({
  initialContent = '',
  placeholder = 'Empieza a escribir... Usa $$ para insertar LaTeX.',
  onChange,
}: LatexEditorProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLatex, setEditingLatex] = useState('')
  const [editingPos, setEditingPos] = useState<number | null>(null)
  const [editingType, setEditingType] = useState<'inline' | 'block'>('inline')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mathematics.configure({
        inlineOptions: {
          onClick: (node, pos) => {
            setEditingLatex(node.attrs.latex || '')
            setEditingPos(pos)
            setEditingType('inline')
            setModalOpen(true)
          },
        },
        blockOptions: {
          onClick: (node, pos) => {
            setEditingLatex(node.attrs.latex || '')
            setEditingPos(pos)
            setEditingType('block')
            setModalOpen(true)
          },
        },
        katexOptions: {
          throwOnError: false,
          macros: {
            '\\R': '\\mathbb{R}',
            '\\N': '\\mathbb{N}',
            '\\Z': '\\mathbb{Z}',
          },
        },
      }),
    ],
    content: initialContent || `<p>Bienvenido al editor. Escribe texto normal y usa <strong>$$...$$</strong> para LaTeX inline o el botón de la barra para bloques matemáticos.</p><p>Ejemplo: La energía es $E = mc^2$ y la identidad de Euler es $e^{i\\pi} + 1 = 0$.</p>`,
    editorProps: {
      attributes: {
        class: styles.editorContent,
        'data-placeholder': placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  const handleSaveMath = useCallback(
    (latex: string) => {
      if (!editor || editingPos === null) return
      editor
        .chain()
        .focus()
        .setNodeSelection(editingPos)
        .command(({ tr, dispatch }) => {
          if (dispatch) {
            const node = tr.doc.nodeAt(editingPos)
            if (node) {
              tr.setNodeMarkup(editingPos, undefined, { ...node.attrs, latex })
            }
          }
          return true
        })
        .run()
      setModalOpen(false)
    },
    [editor, editingPos]
  )

  const insertInlineMath = useCallback(() => {
    editor?.chain().focus().insertInlineMath({ latex: 'x^2' }).run()
  }, [editor])

  const insertBlockMath = useCallback(() => {
    editor?.chain().focus().insertBlockMath({ latex: '\\int_0^\\infty e^{-x}\\,dx = 1' }).run()
  }, [editor])

  return (
    <div className={styles.wrapper}>
      <Toolbar
        editor={editor}
        onInsertInlineMath={insertInlineMath}
        onInsertBlockMath={insertBlockMath}
      />
      <div className={styles.editorArea}>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
      {modalOpen && (
        <MathEditModal
          latex={editingLatex}
          type={editingType}
          onSave={handleSaveMath}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
