import { Editor, useEditorState } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import Latex from "react-latex-next";

import UndoIcon              from "@mui/icons-material/Undo";
import RedoIcon              from "@mui/icons-material/Redo";
import FormatBoldIcon        from "@mui/icons-material/FormatBold";
import FormatItalicIcon      from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon  from "@mui/icons-material/FormatUnderlined";
import FormatAlignLeftIcon   from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon  from "@mui/icons-material/FormatAlignRight";
import LinkIcon              from "@mui/icons-material/Link";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CodeIcon              from "@mui/icons-material/Code";
import TableChartIcon        from "@mui/icons-material/TableChart";
import FullscreenIcon        from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon    from "@mui/icons-material/FullscreenExit";
import ChecklistIcon         from "@mui/icons-material/Checklist";
import FormatColorTextIcon   from "@mui/icons-material/FormatColorText";
import CodeOffIcon           from "@mui/icons-material/CodeOff";
import ImageIcon             from "@mui/icons-material/Image";

// ── SVG icon ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 15 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Sep = () => (
  <div style={{ width: 1, height: 20, background: "#d9e4ee", margin: "0 3px", flexShrink: 0 }} />
);

// ── Botón toolbar ─────────────────────────────────────────────────────────
interface BtnProps {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
const ToolbarBtn = ({ title, onClick, active = false, children, style }: BtnProps) => (
  <button
    type="button" title={title} onMouseDown={onClick}
    style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer",
      padding: 0, flexShrink: 0, transition: "background 0.1s, color 0.1s",
      background: active ? "#daeaf6" : "transparent",
      color: active ? "#4A6D8C" : "#5a7a95",
      fontWeight: active ? 700 : 400,
      ...style,
    }}
    onMouseEnter={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.background = "#e4edf5";
        (e.currentTarget as HTMLButtonElement).style.color = "#2d5be3";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = "#5a7a95";
      }
    }}
  >
    {children}
  </button>
);

// ── Dropdown tipos de lista ───────────────────────────────────────────────
const OL_TYPES = [
  { value: "decimal",     label: "1. Números"     },
  { value: "lower-alpha", label: "a. Min. latinas" },
  { value: "upper-alpha", label: "A. May. latinas" },
  { value: "lower-roman", label: "i. Romanos min"  },
  { value: "upper-roman", label: "I. Romanos may"  },
];

const ListDropdown = ({
  editor, type, active, md,
}: { editor: Editor; type: "bullet" | "ordered"; active: boolean; md: (fn: () => void) => (e: React.MouseEvent) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (type === "bullet") {
    return (
      <ToolbarBtn title="Lista con viñetas" active={active}
        onClick={md(() => editor.chain().focus().toggleBulletList().run())}>
        <FormatListBulletedIcon fontSize="small" />
      </ToolbarBtn>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <ToolbarBtn title="Lista numerada" active={active}
        onClick={md(() => editor.chain().focus().toggleOrderedList().run())}>
        <FormatListNumberedIcon fontSize="small" />
      </ToolbarBtn>
      <button type="button" title="Tipo de lista numerada"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14, height: 32, borderRadius: "0 4px 4px 0", border: "none", cursor: "pointer", padding: 0, background: "transparent", color: "#8daecb", fontSize: 10 }}>
        ▾
      </button>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "white", border: "1px solid #d9e4ee", borderRadius: 8, boxShadow: "0 4px 16px rgba(74,109,140,0.15)", minWidth: 160, overflow: "hidden" }}>
          {OL_TYPES.map((t) => (
            <button key={t.value} type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                if (!editor.isActive("orderedList")) {
                  editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { listStyleType: t.value }).run();
                } else {
                  editor.chain().focus().updateAttributes("orderedList", { listStyleType: t.value }).run();
                }
                setOpen(false);
              }}
              style={{ display: "block", width: "100%", padding: "7px 12px", textAlign: "left", border: "none", cursor: "pointer", fontSize: 13, color: "#1f2c38", background: "transparent" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Color picker ──────────────────────────────────────────────────────────
const COLORS = [
  "#1f2c38", "#4A6D8C", "#2d5be3", "#1a9e5c",
  "#e74c3c", "#e67e22", "#9c27b0", "#8daecb",
];
const ColorPicker = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <ToolbarBtn title="Color de texto" onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
        <FormatColorTextIcon fontSize="small" />
      </ToolbarBtn>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 50, background: "white", border: "1px solid #d9e4ee", borderRadius: 8, boxShadow: "0 4px 16px rgba(74,109,140,0.15)", padding: 8, display: "flex", flexWrap: "wrap", gap: 4, width: 116 }}>
          {COLORS.map((c) => (
            <button key={c} type="button" title={c}
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setOpen(false); }}
              style={{ width: 20, height: 20, borderRadius: 4, background: c, border: "2px solid transparent", cursor: "pointer", padding: 0 }} />
          ))}
          <button type="button" title="Quitar color"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setOpen(false); }}
            style={{ width: 20, height: 20, borderRadius: 4, background: "white", border: "1.5px solid #d9e4ee", cursor: "pointer", fontSize: 10, color: "#8daecb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// ── Panel de imagen seleccionada ─────────────────────────────────────────
interface ImagePanelProps {
  editor: Editor;
  isImage: boolean;
  imageAttrs: Record<string, unknown> | null;
}

const ImagePanel = ({ editor, isImage, imageAttrs }: ImagePanelProps) => {
  if (!isImage) return null;
  const currentWidth = (imageAttrs?.width as string) ?? "";
  const currentAlign = (imageAttrs?.align as string) ?? "left";

  // Con NodeView React, updateAttributes funciona correctamente
  const applyAttrs = (attrs: Record<string, unknown>) => {
    editor.chain().focus().updateAttributes("image", attrs).run();
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "4px 10px", background: "#eef3f8",
      borderBottom: "1.5px solid #d9e4ee", flexWrap: "wrap",
    }}>
      <span style={{ fontSize: 11, color: "#4A6D8C", fontWeight: 600 }}>Imagen:</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#6793ba" }}>Ancho:</span>
        <input
          type="text"
          defaultValue={currentWidth}
          placeholder="ej: 300px, 50%"
          onBlur={(e) => applyAttrs({ width: e.target.value.trim() || null })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyAttrs({ width: (e.target as HTMLInputElement).value.trim() || null });
              (e.target as HTMLInputElement).blur();
            }
          }}
          style={{ width: 90, height: 24, borderRadius: 4, border: "1px solid #c9dae8", padding: "0 6px", fontSize: 12, color: "#1f2c38", outline: "none" }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#6793ba" }}>Alineación:</span>
        {(["left", "center", "right"] as const).map((align) => (
          <button key={align} type="button"
            title={align === "left" ? "Izquierda" : align === "center" ? "Centro" : "Derecha"}
            onMouseDown={(e) => { e.preventDefault(); applyAttrs({ align }); }}
            style={{
              width: 26, height: 26, borderRadius: 4, border: "1px solid",
              borderColor: currentAlign === align ? "#4A6D8C" : "#c9dae8",
              background: currentAlign === align ? "#4A6D8C" : "white",
              color: currentAlign === align ? "white" : "#6793ba",
              cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {align === "left" ? "⬅" : align === "center" ? "↔" : "➡"}
          </button>
        ))}
      </div>
      <button type="button" title="Eliminar imagen"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteSelection().run(); }}
        style={{ height: 24, padding: "0 8px", borderRadius: 4, border: "1px solid #f5c6c6", background: "#fef2f2", color: "#e74c3c", cursor: "pointer", fontSize: 11 }}>
        Eliminar
      </button>
    </div>
  );
};

// ── Toolbar principal ─────────────────────────────────────────────────────
interface ToolbarProps {
  editor: Editor | null;
  onInsertMath: (type: "inline" | "block") => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showHtml?: boolean;
  onToggleHtml?: () => void;
}

export function Toolbar({ editor, onInsertMath, fullscreen, onToggleFullscreen, showHtml, onToggleHtml }: ToolbarProps) {
  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold:       ctx.editor?.isActive("bold")                    ?? false,
      isItalic:     ctx.editor?.isActive("italic")                  ?? false,
      isUnderline:  ctx.editor?.isActive("underline")               ?? false,
      isStrike:     ctx.editor?.isActive("strike")                  ?? false,
      isHighlight:  ctx.editor?.isActive("highlight")               ?? false,
      isSup:        ctx.editor?.isActive("superscript")             ?? false,
      isSub:        ctx.editor?.isActive("subscript")               ?? false,
      isH1:         ctx.editor?.isActive("heading", { level: 1 })   ?? false,
      isH2:         ctx.editor?.isActive("heading", { level: 2 })   ?? false,
      isH3:         ctx.editor?.isActive("heading", { level: 3 })   ?? false,
      isAlignL:     ctx.editor?.isActive({ textAlign: "left" })     ?? false,
      isAlignC:     ctx.editor?.isActive({ textAlign: "center" })   ?? false,
      isAlignR:     ctx.editor?.isActive({ textAlign: "right" })    ?? false,
      isBullet:     ctx.editor?.isActive("bulletList")              ?? false,
      isOrdered:    ctx.editor?.isActive("orderedList")             ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote")              ?? false,
      isCode:       ctx.editor?.isActive("codeBlock")               ?? false,
      isLink:       ctx.editor?.isActive("link")                    ?? false,
      isTaskList:   ctx.editor?.isActive("taskList")                ?? false,
      isImage:      ctx.editor?.isActive("image")                   ?? false,
      imageAttrs:   ctx.editor?.isActive("image")
        ? ctx.editor.getAttributes("image")
        : null,
    }),
  });

  if (!editor) return null;

  const md = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };

  const handleLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url  = window.prompt("URL del enlace:", prev ?? "https://");
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* ── Barra principal ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: "6px 10px", background: "#f7f9fc", borderBottom: "1.5px solid #d9e4ee", minHeight: 46, position: "sticky", top: 0, zIndex: 10 }}>

      {/* Historial */}
      <div style={{ display: "flex", gap: 1 }}>
        <ToolbarBtn title="Deshacer" onClick={md(() => editor.chain().focus().undo().run())}><UndoIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Rehacer"  onClick={md(() => editor.chain().focus().redo().run())}><RedoIcon fontSize="small" /></ToolbarBtn>
      </div>
      <Sep />

      {/* Encabezados */}
      <div style={{ display: "flex", gap: 1 }}>
        {([1, 2, 3] as const).map((level) => (
          <ToolbarBtn key={level} title={`Título ${level}`}
            active={[state?.isH1, state?.isH2, state?.isH3][level - 1]}
            onClick={md(() => editor.chain().focus().toggleHeading({ level }).run())}
            style={{ fontSize: 11, fontWeight: 700, fontFamily: "Georgia, serif", width: 28 }}>
            H{level}
          </ToolbarBtn>
        ))}
      </div>
      <Sep />

      {/* Formato */}
      <div style={{ display: "flex", gap: 1 }}>
        <ToolbarBtn title="Negrita (Ctrl+B)"   active={state?.isBold}      onClick={md(() => editor.chain().focus().toggleBold().run())}><FormatBoldIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Itálica (Ctrl+I)"   active={state?.isItalic}    onClick={md(() => editor.chain().focus().toggleItalic().run())}><FormatItalicIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Subrayado (Ctrl+U)" active={state?.isUnderline} onClick={md(() => editor.chain().focus().toggleUnderline().run())}><FormatUnderlinedIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Tachado"            active={state?.isStrike}    onClick={md(() => editor.chain().focus().toggleStrike().run())}>
          <Icon d="M16.5 7.5c0-2.485-2.015-4.5-4.5-4.5S7.5 5.015 7.5 7.5c0 4.5 9 4.5 9 9 0 2.485-2.015 4.5-4.5 4.5s-4.5-2.015-4.5-4.5M5 12h14" />
        </ToolbarBtn>
        <ToolbarBtn title="Resaltado" active={state?.isHighlight} onClick={md(() => editor.chain().focus().toggleHighlight().run())}>
          <Icon d="M9 3h6l4 4-8 14L3 7z" />
        </ToolbarBtn>
        <ToolbarBtn title="Superíndice x²" active={state?.isSup} onClick={md(() => editor.chain().focus().toggleSuperscript().run())} style={{ fontSize: 12, fontFamily: "Georgia, serif" }}>x²</ToolbarBtn>
        <ToolbarBtn title="Subíndice x₂"   active={state?.isSub} onClick={md(() => editor.chain().focus().toggleSubscript().run())}   style={{ fontSize: 12, fontFamily: "Georgia, serif" }}>x₂</ToolbarBtn>
        <ColorPicker editor={editor} />
      </div>
      <Sep />

      {/* Alineación */}
      <div style={{ display: "flex", gap: 1 }}>
        <ToolbarBtn title="Alinear izquierda" active={state?.isAlignL} onClick={md(() => editor.chain().focus().setTextAlign("left").run())}><FormatAlignLeftIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Centrar"           active={state?.isAlignC} onClick={md(() => editor.chain().focus().setTextAlign("center").run())}><FormatAlignCenterIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Alinear derecha"   active={state?.isAlignR} onClick={md(() => editor.chain().focus().setTextAlign("right").run())}><FormatAlignRightIcon fontSize="small" /></ToolbarBtn>
      </div>
      <Sep />

      {/* Listas */}
      <div style={{ display: "flex", gap: 1, alignItems: "center" }}>
        <ListDropdown editor={editor} type="bullet"  active={state?.isBullet  ?? false} md={md} />
        <ListDropdown editor={editor} type="ordered" active={state?.isOrdered ?? false} md={md} />
        <ToolbarBtn title="Lista de tareas" active={state?.isTaskList} onClick={md(() => editor.chain().focus().toggleTaskList().run())}><ChecklistIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Cita" active={state?.isBlockquote} onClick={md(() => editor.chain().focus().toggleBlockquote().run())}>
          <Icon d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </ToolbarBtn>
        <ToolbarBtn title="Bloque de código" active={state?.isCode} onClick={md(() => editor.chain().focus().toggleCodeBlock().run())}><CodeIcon fontSize="small" /></ToolbarBtn>
      </div>
      <Sep />

      {/* Link, tabla e imagen */}
      <div style={{ display: "flex", gap: 1 }}>
        <ToolbarBtn title="Enlace" active={state?.isLink} onClick={md(handleLink)}><LinkIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Tabla 3×3" onClick={md(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())}><TableChartIcon fontSize="small" /></ToolbarBtn>
        <ToolbarBtn title="Insertar imagen" onClick={(e) => {
          e.preventDefault();
          const url = window.prompt("URL de la imagen:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}><ImageIcon fontSize="small" /></ToolbarBtn>
      </div>
      <Sep />

      {/* LaTeX */}
      <button type="button" title="Insertar fórmula LaTeX"
        onMouseDown={(e) => { e.preventDefault(); onInsertMath("inline"); }}
        style={{ display: "inline-flex", alignItems: "center", padding: "0 10px", height: 32, borderRadius: 6, border: "1.5px solid #c9dae8", background: "#eef3f8", color: "#1a3a52", cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif", flexShrink: 0 }}>
        <Latex>{"\\(f(x)\\)"}</Latex>
      </button>

      <div style={{ flex: 1 }} />

      {/* HTML toggle */}
      {onToggleHtml && (
        <ToolbarBtn title={showHtml ? "Ocultar HTML" : "Ver/editar HTML"} active={showHtml} onClick={(e) => { e.preventDefault(); onToggleHtml(); }}>
          <CodeOffIcon fontSize="small" />
        </ToolbarBtn>
      )}

      {/* Fullscreen */}
      {onToggleFullscreen && (
        <ToolbarBtn title={fullscreen ? "Salir pantalla completa" : "Pantalla completa"} onClick={(e) => { e.preventDefault(); onToggleFullscreen(); }}>
          {fullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </ToolbarBtn>
      )}
      </div>{/* fin barra principal */}

      {/* ── Panel imagen seleccionada ── */}
      <ImagePanel
        editor={editor}
        isImage={state?.isImage ?? false}
        imageAttrs={state?.imageAttrs ?? null}
      />
    </div>
  );
}