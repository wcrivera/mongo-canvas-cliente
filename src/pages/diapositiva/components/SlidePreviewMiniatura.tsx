// src/pages/diapositiva/SlidePreview.tsx
import { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import RevealMath from "reveal.js";
// import RevealMath from "reveal.js/plugin/math/math.js";
import type { ISlide, IConfigReveal } from "./../EditorDiapositiva";
import TiptapRenderer from "../../../components/CKEditor/TiptapRenderer";

interface Props {
  slide: ISlide;
  config: IConfigReveal;
  width: number;
  height: number;
}

const CANVAS_W = 1280;
const CANVAS_H = 800;

// ── Inyectar recursos globales una sola vez ───────────────────────────────────
//
// RevealMath.KaTeX necesita window.katex disponible. Como usamos Reveal
// embebido en el mismo DOM (no iframe), inyectamos KaTeX CDN en el <head>.
// Tailwind también se inyecta aquí para que las clases grid/col-span
// del TwoColumnsPlugin funcionen en el preview igual que en Canvas.

let globalResourcesInjected = false;

function injectGlobalResources() {
  if (globalResourcesInjected) return;
  globalResourcesInjected = true;

  // KaTeX CSS
  if (!document.getElementById("katex-css")) {
    const link = document.createElement("link");
    link.id = "katex-css";
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(link);
  }

  // KaTeX JS — RevealMath lo busca en window.katex
  if (!document.getElementById("katex-js")) {
    const script = document.createElement("script");
    script.id = "katex-js";
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    document.head.appendChild(script);
  }
}

// ── Componente ────────────────────────────────────────────────────────────────

const SlidePreview = ({ slide, config, width, height }: Props) => {
  const scale = Math.min(width / CANVAS_W, height / CANVAS_H);
  const deckDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deckRef = useRef<any>(null);

  // Inyectar KaTeX global una sola vez al montar cualquier SlidePreview
  useEffect(() => {
    injectGlobalResources();
  }, []);

  // Inyectar/actualizar CSS de Reveal
  useEffect(() => {
    // Core CSS — una sola vez
    if (!document.getElementById("reveal-core-css")) {
      const link = document.createElement("link");
      link.id = "reveal-core-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css";
      document.head.appendChild(link);
    }

    // Theme CSS — actualizar href cuando cambia el tema
    const existing = document.getElementById(
      "reveal-theme-css",
    ) as HTMLLinkElement | null;
    const themeUrl = `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${config.tema}.css`;
    if (existing) {
      if (existing.href !== themeUrl) existing.href = themeUrl;
    } else {
      const link = document.createElement("link");
      link.id = "reveal-theme-css";
      link.rel = "stylesheet";
      link.href = themeUrl;
      document.head.appendChild(link);
    }
  }, [config.tema]);

  // Inicializar/reinicializar Reveal cuando cambia el contenido
  useEffect(() => {
    if (!deckDivRef.current) return;

    if (deckRef.current) {
      try {
        deckRef.current.destroy();
      } catch {
        /* ignorar */
      }
      deckRef.current = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deckRef.current = new (Reveal as any)(deckDivRef.current, {
      hash: false,
      controls: false,
      progress: false,
      keyboard: false,
      embedded: true,
      center: false,
      transition: "none",
      backgroundTransition: "none",
      margin: 0.05,
      width: CANVAS_W,
      height: CANVAS_H,
      minScale: 0.05,
      maxScale: 1.0,
      // RevealMath.KaTeX procesa \(...\) y \[...\] — igual que en Canvas
      plugins: [RevealMath],
      math: {
        renderer: "KaTeX",
      },
    });

    deckRef.current.initialize().catch(() => {});

    return () => {
      try {
        if (deckRef.current) {
          deckRef.current.destroy();
          deckRef.current = null;
        }
      } catch {
        /* ignorar */
      }
    };
  }, [
    slide.id,
    slide.contenido,
    slide.contenido_derecho,
    slide.fondo,
    config.tema,
  ]);

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <div
          ref={deckDivRef}
          className="reveal"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          <div className="slides">
            <section>
              <TiptapRenderer style={{ textAlign: "left", fontSize: "28px" }}>
                {slide.contenido}
              </TiptapRenderer>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidePreview;
