import type { Editor } from '@tiptap/react'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  editor: Editor | null
  onInsertInlineMath: () => void
  onInsertBlockMath: () => void
}

interface ToolbarButton {
  label: string
  title: string
  action: () => void
  isActive?: () => boolean
  className?: string
}

export function Toolbar({ editor, onInsertInlineMath, onInsertBlockMath }: ToolbarProps) {
  if (!editor) return null

  const textButtons: ToolbarButton[] = [
    {
      label: 'B',
      title: 'Negrita',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
      className: styles.bold,
    },
    {
      label: 'I',
      title: 'Itálica',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
      className: styles.italic,
    },
  ]

  const headingButtons = [1, 2, 3].map((level) => ({
    label: `H${level}`,
    title: `Encabezado ${level}`,
    action: () => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run(),
    isActive: () => editor.isActive('heading', { level }),
  }))

  const listButtons: ToolbarButton[] = [
    {
      label: '≡',
      title: 'Lista con viñetas',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      label: '1.',
      title: 'Lista numerada',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
  ]

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        {textButtons.map((btn) => (
          <button
            key={btn.title}
            title={btn.title}
            onClick={btn.action}
            className={`${styles.btn} ${btn.className || ''} ${btn.isActive?.() ? styles.active : ''}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className={styles.sep} />

      <div className={styles.group}>
        {headingButtons.map((btn) => (
          <button
            key={btn.title}
            title={btn.title}
            onClick={btn.action}
            className={`${styles.btn} ${btn.isActive?.() ? styles.active : ''}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className={styles.sep} />

      <div className={styles.group}>
        {listButtons.map((btn) => (
          <button
            key={btn.title}
            title={btn.title}
            onClick={btn.action}
            className={`${styles.btn} ${btn.isActive?.() ? styles.active : ''}`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className={styles.sep} />

      <div className={styles.group}>
        <button
          title="Insertar LaTeX inline ($...$)"
          onClick={onInsertInlineMath}
          className={`${styles.btn} ${styles.mathBtn}`}
        >
          <span className={styles.mathIcon}>$x$</span>
        </button>
        <button
          title="Insertar bloque LaTeX ($$...$$)"
          onClick={onInsertBlockMath}
          className={`${styles.btn} ${styles.mathBtn}`}
        >
          <span className={styles.mathIcon}>$$</span>
        </button>
      </div>
    </div>
  )
}
