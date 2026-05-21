// src/pages/diapositiva/SlidePreview.tsx
import { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import type { IConfigReveal, ISlide } from "../../diapositiva/EditorDiapositiva";
import { transformarHtmlParaReveal } from "../../diapositiva/compilarHtmlReveal";


interface Props {
  slide: ISlide;
  config: IConfigReveal;
  width?: number;
  height?: number;
}

const CANVAS_W = 1280;
const CANVAS_H = 800;

const Diapositiva = ({ slide, config, width = 140, height = 88 }: Props) => {
  const scale = width / CANVAS_W;
  const deckDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deckRef = useRef<any>(null);

  // Inyectar CSS de Reveal una sola vez en el documento
  useEffect(() => {
    const cssIds = ["reveal-core-css", "reveal-theme-css"];
    const cssUrls = [
      "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css",
      `https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/${config.tema}.css`,
    ];
    cssIds.forEach((id, i) => {
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = cssUrls[i];
        document.head.appendChild(link);
      }
    });
  }, [config.tema]);

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
    //   overview: false,
    //   touch: false,
      embedded: true,
      center: false,
      transition: "none",
      backgroundTransition: "none",
      margin: 0.05,
      width: CANVAS_W,
      height: CANVAS_H,
      minScale: 0.05,
      maxScale: 1.0,
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
  }, [slide.id, slide.contenido, slide.fondo, config.tema]);

  const contenido = transformarHtmlParaReveal(slide.contenido ?? "");
  const fondoAttr = slide.fondo ? { "data-background-color": slide.fondo } : {};

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
            <section
              {...fondoAttr}
              dangerouslySetInnerHTML={{ __html: contenido }}
              style={{ textAlign: "left", fontSize: "28px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diapositiva;
