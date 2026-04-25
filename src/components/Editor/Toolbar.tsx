import { Editor } from '@tiptap/react'
import React from 'react'
import Latex from 'react-latex-next';

import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';

import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
// import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';

import LinkIcon from '@mui/icons-material/Link';

import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import CodeIcon from '@mui/icons-material/Code';

import TableChartIcon from '@mui/icons-material/TableChart';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';


// ── Icono SVG ──────────────────────────────────────────────────────────────
interface IconProps { d: string; size?: number }
const Icon = ({ d, size = 15 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

// ── Separador visual ───────────────────────────────────────────────────────
const Sep = () => <div className="w-px h-5 bg-chapter-100 mx-1 flex-shrink-0" />

// ── Botón de toolbar ───────────────────────────────────────────────────────
interface BtnProps {
  title: string
  onClick: (e: React.MouseEvent) => void
  active?: boolean
  children: React.ReactNode
  className?: string
}
const ToolbarBtn = ({ title, onClick, active = false, children, className = '' }: BtnProps) => (
  <button
    type="button"
    title={title}
    onMouseDown={onClick}
    className={[
      'inline-flex items-center justify-center w-8 h-8 rounded-md border-none cursor-pointer',
      'transition-all duration-100 active:scale-95 select-none flex-shrink-0',
      active
        ? 'bg-chapter-100 text-chapter-600'
        : 'bg-transparent text-chapter-400 hover:bg-chapter-50 hover:text-chapter-500',
      className,
    ].join(' ')}
  >
    {children}
  </button>
)

// ── Paths SVG ──────────────────────────────────────────────────────────────
const ICONS = {
  bold:       <FormatBoldIcon fontSize="small" />,
  italic:     <FormatItalicIcon fontSize="small" />,
  underline:  <FormatUnderlinedIcon fontSize="small" />,
  strike:     'M16.5 7.5c0-2.485-2.015-4.5-4.5-4.5S7.5 5.015 7.5 7.5c0 4.5 9 4.5 9 9 0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5M5 12h14',
  ul:         <FormatListBulletedIcon fontSize="small" />,
  ol:         <FormatListNumberedIcon fontSize="small" />,
  quote:      'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  alignL:     <FormatAlignLeftIcon fontSize="small" />,
  alignC:     <FormatAlignCenterIcon fontSize="small" />,
  alignR:     <FormatAlignRightIcon fontSize="small" />,
  link:       <LinkIcon fontSize="small" />,
  table:      <TableChartIcon fontSize="small" />,
  code:       <CodeIcon fontSize="small" />,
  highlight:  'M9 3h6l4 4-8 14L3 7z',
  undo:       <UndoIcon fontSize="small" />,
  redo:       <RedoIcon fontSize="small" />,
  fullscreen: <FullscreenIcon fontSize="small" />,
  exitFull:   <FullscreenExitIcon fontSize="small" />,
}

const mathBtnCls = [
  'inline-flex items-center px-2.5 h-8 rounded-md border border-chapter-200',
  'bg-chapter-50 text-chapter-700 font-serif cursor-pointer transition-all',
  'hover:bg-chapter-100 hover:border-chapter-400 active:scale-95 select-none',
].join(' ')

// ── Props del Toolbar ──────────────────────────────────────────────────────
interface ToolbarProps {
  editor: Editor | null
  onInsertInlineMath: () => void
  onInsertBlockMath: () => void
  fullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function Toolbar({ editor, onInsertInlineMath, onInsertBlockMath, fullscreen, onToggleFullscreen }: ToolbarProps) {
  if (!editor) return null

  // preventDefault para no robar el foco del editor
  const md = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn() }

  const handleLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL del enlace:', prev ?? 'https://')
    if (url === null) return
    if (!url) { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const ALIGNS = [
    { align: 'left'   as const, title: 'Alinear izquierda', icon: ICONS.alignL },
    { align: 'center' as const, title: 'Centrar',            icon: ICONS.alignC },
    { align: 'right'  as const, title: 'Alinear derecha',    icon: ICONS.alignR },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-1.5 bg-chapter-50 border-b border-chapter-100 min-h-[46px] sticky top-0 z-10">

      {/* Historial */}
      <div className="flex gap-0.5">
        <ToolbarBtn title="Deshacer (Ctrl+Z)" onClick={md(() => editor.chain().focus().undo().run())}>
          {/* <Icon d={ICONS.undo} /> */}<UndoIcon fontSize="small" />
        </ToolbarBtn>
        <ToolbarBtn title="Rehacer (Ctrl+Y)" onClick={md(() => editor.chain().focus().redo().run())}>
          {/* <Icon d={ICONS.redo} /> */}<RedoIcon fontSize="small" />
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Encabezados */}
      <div className="flex gap-0.5">
        {([1, 2, 3] as const).map(level => (
          <ToolbarBtn key={level} title={`Título ${level}`}
            active={editor.isActive('heading', { level })}
            onClick={md(() => editor.chain().focus().toggleHeading({ level }).run())}>
            <span className="text-[11px] font-bold font-serif">H{level}</span>
          </ToolbarBtn>
        ))}
      </div>

      <Sep />

      {/* Formato */}
      <div className="flex gap-0.5">
        <ToolbarBtn title="Negrita (Ctrl+B)" active={editor.isActive('bold')}
          onClick={md(() => editor.chain().focus().toggleBold().run())}>
          <FormatBoldIcon fontSize="small" />
        </ToolbarBtn>
        <ToolbarBtn title="Itálica (Ctrl+I)" active={editor.isActive('italic')}
          onClick={md(() => editor.chain().focus().toggleItalic().run())}>
          <FormatItalicIcon fontSize="small" />
        </ToolbarBtn>
        <ToolbarBtn title="Subrayado (Ctrl+U)" active={editor.isActive('underline')}
          onClick={md(() => editor.chain().focus().toggleUnderline().run())}>
          <FormatUnderlinedIcon fontSize="small" />
        </ToolbarBtn>
        <ToolbarBtn title="Tachado" active={editor.isActive('strike')}
          onClick={md(() => editor.chain().focus().toggleStrike().run())}>
          <Icon d={ICONS.strike} />
        </ToolbarBtn>
        <ToolbarBtn title="Resaltado" active={editor.isActive('highlight')}
          onClick={md(() => editor.chain().focus().toggleHighlight().run())}>
          <Icon d={ICONS.highlight} />
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Alineación */}
      <div className="flex gap-0.5">
        {ALIGNS.map(({ align, title, icon }) => (
          <ToolbarBtn key={align} title={title}
            active={editor.isActive({ textAlign: align })}
            onClick={md(() => editor.chain().focus().setTextAlign(align).run())}>
            {icon}
          </ToolbarBtn>
        ))}
      </div>

      <Sep />

      {/* Listas y bloques */}
      <div className="flex gap-0.5">
        <ToolbarBtn title="Lista con viñetas" active={editor.isActive('bulletList')}
          onClick={md(() => editor.chain().focus().toggleBulletList().run())}>
          {ICONS.ul}
        </ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive('orderedList')}
          onClick={md(() => editor.chain().focus().toggleOrderedList().run())}>
          {ICONS.ol}
        </ToolbarBtn>
        <ToolbarBtn title="Cita" active={editor.isActive('blockquote')}
          onClick={md(() => editor.chain().focus().toggleBlockquote().run())}>
          <Icon d={ICONS.quote} />
        </ToolbarBtn>
        <ToolbarBtn title="Bloque de código" active={editor.isActive('codeBlock')}
          onClick={md(() => editor.chain().focus().toggleCodeBlock().run())}>
          {ICONS.code} 
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Link y tabla */}
      <div className="flex gap-0.5">
        <ToolbarBtn title="Enlace" active={editor.isActive('link')} onClick={md(handleLink)}>
          {ICONS.link}
        </ToolbarBtn>
        <ToolbarBtn title="Tabla 3×3"
          onClick={md(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}>
          {ICONS.table}
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Matemáticas */}
      <div className="flex gap-1">
        <button type="button" title="Fórmula inline"
          onMouseDown={md(onInsertInlineMath)}
          className={`${mathBtnCls} text-[12px]`}>
            <Latex>{'\\(f(x)\\)'}</Latex>
        </button>
        <button type="button" title="Bloque matemático"
          onMouseDown={md(onInsertBlockMath)}
          className={`${mathBtnCls} text-[11px]`}>
          <Latex>{'\\(\\displaystyle \\sum \\)'}</Latex>
        </button>
      </div>

      <div className="flex-1" />

      {/* Fullscreen */}
      {onToggleFullscreen && (
        <ToolbarBtn
          title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={md(onToggleFullscreen)}>
          {fullscreen ? ICONS.exitFull : ICONS.fullscreen}
        </ToolbarBtn>
      )}
    </div>
  )
}