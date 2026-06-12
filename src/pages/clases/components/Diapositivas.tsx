// src/pages/diapositiva/SlidePreview.tsx
import { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import type {
  IConfigReveal,
  ISlide,
} from "../../diapositiva/EditorDiapositiva";
import { transformarHtmlParaReveal } from "../../diapositiva/compilarHtmlReveal";
import RevealMath from "reveal.js";
import TiptapRenderer from "../../../components/CKEditor/TiptapRenderer";

interface Props {
  slides: ISlide[];
  config: IConfigReveal;
  width?: number;
  height?: number;
}

const Diapositivas = ({ slides, config, width = 140, height = 88 }: Props) => {
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
      controls: true,
      progress: false,
      keyboard: false,
      embedded: true,
      center: false,
      transition: "none",
      backgroundTransition: "none",
      margin: 0.05,
      width: width,
      height: height,
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
  }, [slides, config.tema, width, height]);

  return (
    <div
      ref={deckDivRef}
      className="reveal"
      style={{ width: width, height: height }}
    >
      <div className="slides">
        {slides.map((slide, index) => {
          const contenido = transformarHtmlParaReveal(slide.contenido ?? "");
          return (
            <section
              key={index}
              style={{ textAlign: "left", fontSize: "28px" }}
            >
              <TiptapRenderer style={{ textAlign: "left", fontSize: "28px" }}>
                {contenido}
              </TiptapRenderer>
            </section>
          );
        })}
      </div>
    </div>
  );
};
export default Diapositivas;
