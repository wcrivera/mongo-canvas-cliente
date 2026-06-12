import { useEffect, useRef } from "react";

import Reveal from "reveal.js";
import RevealMath from "reveal.js";
import TiptapRenderer from "../../../components/CKEditor/TiptapRenderer";
import type { IConfigReveal, ISlide } from "../EditorDiapositiva";

type Props = {
  slides: ISlide[];
  config: IConfigReveal;
  width: number;
  height: number;
};

const CANVAS_W = 1280;
const CANVAS_H = 800;

const SlidePreview = ({ slides, config, width, height }: Props) => {
  console.log(slides);

  const deckDivRef = useRef<HTMLDivElement>(null);

  // Inicializar/reinicializar Reveal cuando cambia el contenido
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deck = new (Reveal as any)(deckDivRef.current, {
      hash: false,
      controls: true,
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

    deck.initialize().catch(() => {});

    return () => {
      try {
        deck.destroy();
      } catch {
        /* ignorar */
      }
    };
  }, [slides, config, width, height]);
  return (
    <div
      ref={deckDivRef}
      className="reveal"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="slides">
        {slides.map((slide) => {
          return (
            <section key={slide.id}>
              <TiptapRenderer
                style={{ textAlign: "justify", fontSize: "28px" }}
              >
                {slide.contenido}
              </TiptapRenderer>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SlidePreview;
