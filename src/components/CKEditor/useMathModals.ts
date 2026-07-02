// src/components/CKEditor/useMathModals.ts
//
// Hook COMPARTIDO con toda la lógica de modales de los editores CKEditor
// (MathTextEditor / MathTextEditorInline): estado de los 4 modales
// (latex / url-imagen / entorno / geogebra), los refs de callbacks, los
// useEffect de sincronización y todos los handlers.
//
// El `editorRef` lo crea y posee el COMPONENTE (un useRef local) y se pasa
// por parámetro. Así el componente puede asignar `editorRef.current = editor`
// en onReady sin violar la regla react-hooks/immutability (mutar un ref local
// está permitido; mutar una propiedad del objeto del hook, no).
//
// Antes esto estaba duplicado idéntico en cada editor. Cada editor ahora:
//   const editorRef = useRef<Editor | null>(null);
//   const m = useMathModals(editorRef);
//   - cablea su editorConfig con m.handleInsertMath / m.handleEditMath /
//     m.handleEditSubtitulo / m.handleInsertUrl / m.handleInsertGaleria /
//     m.handleInsertGeoGebra
//   - asigna editorRef.current = editor en onReady
//   - renderiza <MathEditorModals {...m} /> (ver MathEditorModals.tsx)
//
// El Inline no usa GeoGebra: simplemente ignora geogebraOpen / sus handlers.

import { useState, useCallback, useRef, useEffect, type RefObject } from "react";
import type { Editor } from "ckeditor5";
import type { TipoEntorno } from "./plugins/MathBlockPlugin";
import type { GeoGebraParams } from "./plugins/InsertGeoGebraPlugin";
import {
  type LatexModalState,
  type UrlModalState,
  type EnvModalState,
  LATEX_MODAL_CLOSED,
  ENV_MODAL_CLOSED,
} from "./mathEditorShared";

export function useMathModals(editorRef: RefObject<Editor | null>) {
  const [latexModal, setLatexModal] =
    useState<LatexModalState>(LATEX_MODAL_CLOSED);
  const [urlModal, setUrlModal] = useState<UrlModalState>({ open: false });
  const [envModal, setEnvModal] = useState<EnvModalState>(ENV_MODAL_CLOSED);
  const [geogebraOpen, setGeogebraOpen] = useState(false);

  // Refs a los callbacks onSave de los modales — actualizados via useEffect
  // para no violar react-hooks/refs (prohibido escribir refs durante render).
  const latexOnSaveRef = useRef(latexModal.onSave);
  const envOnSaveRef = useRef(envModal.onSave);

  useEffect(() => {
    latexOnSaveRef.current = latexModal.onSave;
  }, [latexModal.onSave]);
  useEffect(() => {
    envOnSaveRef.current = envModal.onSave;
  }, [envModal.onSave]);

  // ── Imagen (URL / galería) ──────────────────────────────────────────────────

  const handleInsertUrl = useCallback(
    () => setUrlModal({ open: true, tab: 0 }),
    [],
  );
  const handleInsertGaleria = useCallback(
    () => setUrlModal({ open: true, tab: 1 }),
    [],
  );
  const handleImageUrlInsert = useCallback(
    (url: string, alt: string) => {
      editorRef.current?.execute("insertImageFromUrl", { url, alt });
      editorRef.current?.editing.view.focus();
      setUrlModal({ open: false });
    },
    [editorRef],
  );
  const handleUrlModalClose = useCallback(
    () => setUrlModal({ open: false, tab: 0 }),
    [],
  );

  // ── GeoGebra ────────────────────────────────────────────────────────────────

  const handleInsertGeoGebra = useCallback(() => setGeogebraOpen(true), []);
  const handleGeoGebraInsert = useCallback(
    (params: GeoGebraParams) => {
      editorRef.current?.execute("insertGeoGebra", params);
      editorRef.current?.editing.view.focus();
      setGeogebraOpen(false);
    },
    [editorRef],
  );
  const handleGeoGebraClose = useCallback(() => setGeogebraOpen(false), []);

  // ── Fórmulas LaTeX ──────────────────────────────────────────────────────────

  const handleInsertMath = useCallback(() => {
    setLatexModal({ open: true, latex: "", type: "inline", onSave: null });
  }, []);

  const handleEditMath = useCallback(
    (
      latex: string,
      type: "inline" | "block",
      onSave: (newLatex: string, newType: "inline" | "block") => void,
    ) => {
      setLatexModal({ open: true, latex, type, onSave });
    },
    [],
  );

  const handleLatexModalSave = useCallback(
    (latex: string, type: "inline" | "block") => {
      if (latexOnSaveRef.current) {
        // Editar existente: delegar al callback del plugin
        latexOnSaveRef.current(latex, type);
      } else {
        // Insertar nuevo: ejecutar comando
        const cmd = type === "inline" ? "insertMathInline" : "insertMathBlock";
        editorRef.current?.execute(cmd, { latex });
        editorRef.current?.editing.view.focus();
      }
      setLatexModal(LATEX_MODAL_CLOSED);
    },
    [editorRef],
  );

  const handleLatexModalClose = useCallback(
    () => setLatexModal(LATEX_MODAL_CLOSED),
    [],
  );

  // ── Entornos matemáticos ────────────────────────────────────────────────────

  const handleEditSubtitulo = useCallback(
    (
      tipo: TipoEntorno,
      subtituloActual: string,
      onSave: (nuevoSubtitulo: string) => void,
    ) => {
      setEnvModal({
        open: true,
        tipo,
        subtituloActual,
        modoInsertar: subtituloActual === "",
        onSave,
      });
    },
    [],
  );

  const handleEnvModalSave = useCallback((subtitulo: string) => {
    envOnSaveRef.current?.(subtitulo);
    setEnvModal(ENV_MODAL_CLOSED);
  }, []);

  const handleEnvModalClose = useCallback(
    () => setEnvModal(ENV_MODAL_CLOSED),
    [],
  );

  // ── Foco (manejado por CSS :focus-within) ───────────────────────────────────

  const handleFocus = useCallback(() => {}, []);
  const handleBlur = useCallback(() => {}, []);

  return {
    // estado de los modales
    latexModal,
    urlModal,
    envModal,
    geogebraOpen,

    // cableado de editorConfig
    handleInsertMath,
    handleEditMath,
    handleEditSubtitulo,
    handleInsertUrl,
    handleInsertGaleria,
    handleInsertGeoGebra,

    // cableado del render de modales
    handleImageUrlInsert,
    handleUrlModalClose,
    handleGeoGebraInsert,
    handleGeoGebraClose,
    handleLatexModalSave,
    handleLatexModalClose,
    handleEnvModalSave,
    handleEnvModalClose,

    // foco
    handleFocus,
    handleBlur,
  };
}

export type UseMathModals = ReturnType<typeof useMathModals>;