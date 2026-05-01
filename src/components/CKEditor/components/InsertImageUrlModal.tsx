import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, CircularProgress,
  Tabs, Tab, IconButton, Tooltip,
} from "@mui/material";
import LinkIcon        from "@mui/icons-material/Link";
import CollectionsIcon from "@mui/icons-material/Collections";
import FolderIcon      from "@mui/icons-material/Folder";
import ArrowBackIcon   from "@mui/icons-material/ArrowBack";

interface Props {
  siglaCurso:  string;
  initialTab?: 0 | 1;
  onInsert:    (url: string, alt: string) => void;
  onClose:     () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
const getToken    = () => sessionStorage.getItem("auth_token") ?? "";

// ── Componente ────────────────────────────────────────────────────────────────

export const InsertImageUrlModal = ({ siglaCurso, initialTab = 0, onInsert, onClose }: Props) => {
  const [tab, setTab] = useState<0 | 1>(initialTab);

  // ── Tab URL ────────────────────────────────────────────────────────────────
  const [url,     setUrl]     = useState("");
  const [alt,     setAlt]     = useState("");
  const [error,   setError]   = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Tab Galería ────────────────────────────────────────────────────────────
  // Vista: "carpetas" | "imagenes"
  const [vista,        setVista]        = useState<"carpetas" | "imagenes">("carpetas");
  const [carpetas,     setCarpetas]     = useState<string[]>([]);
  const [carpetaActiva, setCarpetaActiva] = useState<string>("");
  const [imagenes,     setImagenes]     = useState<string[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [cargando,     setCargando]     = useState(false);
  const [errMsg,       setErrMsg]       = useState<string | null>(null);

  // Foco al abrir tab URL
  useEffect(() => {
    if (tab === 0) setTimeout(() => inputRef.current?.focus(), 50);
  }, [tab]);

  // Cargar carpetas al abrir tab galería
  useEffect(() => {
    if (tab !== 1) return;
    if (carpetas.length > 0) return;

    const cargar = async () => {
      setCargando(true);
      setErrMsg(null);
      try {
        const resp = await fetch(`${BACKEND_URL}/api/upload/carpetas`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const body = await resp.json() as { ok: boolean; carpetas: string[]; msg?: string };
        if (!body.ok) throw new Error(body.msg);
        setCarpetas(body.carpetas);
        // Si hay sigla del curso activo, resaltarla pero no entrar automáticamente
      } catch {
        setErrMsg("No se pudieron cargar las carpetas.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [tab, carpetas.length]);

  // Cargar imágenes al entrar a una carpeta
  const abrirCarpeta = async (sigla: string) => {
    setCargando(true);
    setErrMsg(null);
    setImagenes([]);
    setSeleccionada(null);
    setCarpetaActiva(sigla);
    setVista("imagenes");

    try {
      const resp = await fetch(`${BACKEND_URL}/api/upload/imagenes/${sigla}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const body = await resp.json() as { ok: boolean; imagenes: string[]; msg?: string };
      if (!body.ok) throw new Error(body.msg);
      setImagenes(body.imagenes);
      if (body.imagenes.length === 0) {
        setErrMsg("Esta carpeta no tiene imágenes todavía.");
      }
    } catch {
      setErrMsg("No se pudieron cargar las imágenes.");
    } finally {
      setCargando(false);
    }
  };

  const volverACarpetas = () => {
    setVista("carpetas");
    setCarpetaActiva("");
    setImagenes([]);
    setSeleccionada(null);
    setErrMsg(null);
  };

  // ── Handlers Tab URL ───────────────────────────────────────────────────────

  const handleConfirmUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("Ingresa una URL de imagen"); return; }
    if (!/^https?:\/\/.+\..+/i.test(trimmed)) {
      setError("La URL debe comenzar con http:// o https://");
      return;
    }
    onInsert(trimmed, alt.trim());
    onClose();
  };

  const handleConfirmGaleria = () => {
    if (!seleccionada) return;
    const nombre = seleccionada.split("/").pop() ?? "";
    onInsert(seleccionada, nombre);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter")  handleConfirmUrl();
    if (e.key === "Escape") onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>

      <DialogTitle sx={{
        bgcolor: "#4A6D8C", color: "white",
        display: "flex", alignItems: "center", gap: 1.5, py: 2,
      }}>
        <CollectionsIcon />
        <span>Insertar imagen</span>
      </DialogTitle>

      <Tabs value={tab} onChange={(_e, v) => { setTab(v as 0 | 1); }}
        sx={{
          borderBottom: "1px solid #e2e8f0",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: 14 },
          "& .Mui-selected": { color: "#4A6D8C !important" },
          "& .MuiTabs-indicator": { bgcolor: "#4A6D8C" },
        }}>
        <Tab icon={<LinkIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Por URL" />
        <Tab icon={<CollectionsIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Mis imágenes" />
      </Tabs>

      <DialogContent sx={{ pt: 2.5, pb: 1, minHeight: 380 }}>

        {/* ── Tab URL ── */}
        {tab === 0 && (
          <div className="flex flex-col gap-4">
            <TextField
              inputRef={inputRef}
              label="URL de la imagen"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); setPreview(false); }}
              onKeyDown={handleKeyDown}
              error={!!error}
              helperText={error ?? ""}
              size="small" fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              label="Texto alternativo (opcional)"
              placeholder="Descripción de la imagen"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small" fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            {url.trim() && !error && (
              <Button size="small" variant="text" onClick={() => setPreview(p => !p)}
                sx={{ color: "#6793ba", alignSelf: "flex-start", p: 0 }}>
                {preview ? "Ocultar preview" : "Ver preview"}
              </Button>
            )}
            {preview && url.trim() && (
              <div style={{
                border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden",
                maxHeight: 280, display: "flex", alignItems: "center",
                justifyContent: "center", background: "#f8fafc",
              }}>
                <img src={url.trim()} alt={alt || "preview"}
                  style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }}
                  onError={() => setError("No se pudo cargar la imagen. Verifica la URL.")}
                />
              </div>
            )}
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              La imagen debe ser accesible públicamente desde internet.
            </Typography>
          </div>
        )}

        {/* ── Tab Galería ── */}
        {tab === 1 && (
          <div className="flex flex-col" style={{ minHeight: 340 }}>

            {/* Header de navegación */}
            <div className="flex items-center gap-2 mb-3" style={{ minHeight: 32 }}>
              {vista === "imagenes" && (
                <Tooltip title="Volver a carpetas">
                  <IconButton size="small" onClick={volverACarpetas}
                    sx={{ color: "#4A6D8C", border: "1px solid #d9e4ee", borderRadius: 1.5 }}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Typography variant="caption" sx={{ color: "#6793ba", fontWeight: 600, letterSpacing: "0.04em" }}>
                {vista === "carpetas"
                  ? "Selecciona una carpeta"
                  : `📁 ${carpetaActiva}  —  ${imagenes.length} imagen${imagenes.length !== 1 ? "es" : ""}`}
              </Typography>
              {vista === "carpetas" && siglaCurso && (
                <Typography variant="caption" sx={{ color: "#94a3b8", ml: "auto" }}>
                  Curso activo: <strong>{siglaCurso.toUpperCase()}</strong>
                </Typography>
              )}
            </div>

            {/* Loading */}
            {cargando && (
              <div className="flex justify-center items-center flex-1 py-12">
                <CircularProgress sx={{ color: "#4A6D8C" }} />
              </div>
            )}

            {/* Error */}
            {errMsg && !cargando && (
              <div className="flex flex-col items-center gap-2 py-10 text-center flex-1">
                <CollectionsIcon sx={{ fontSize: 40, color: "#b3c9dd" }} />
                <Typography variant="body2" sx={{ color: "#6793ba" }}>{errMsg}</Typography>
              </div>
            )}

            {/* Vista carpetas */}
            {!cargando && vista === "carpetas" && carpetas.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 10,
                maxHeight: 380,
                overflowY: "auto",
              }}>
                {carpetas.map((carpeta) => (
                  <button
                    key={carpeta}
                    onClick={() => abrirCarpeta(carpeta)}
                    style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: 6, padding: "14px 8px",
                      borderRadius: 10, cursor: "pointer",
                      border: carpeta === siglaCurso.toUpperCase()
                        ? "2px solid #4A6D8C"
                        : "1.5px solid #e2e8f0",
                      background: carpeta === siglaCurso.toUpperCase()
                        ? "#f0f4f8"
                        : "white",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#6793ba";
                      (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        carpeta === siglaCurso.toUpperCase() ? "#4A6D8C" : "#e2e8f0";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        carpeta === siglaCurso.toUpperCase() ? "#f0f4f8" : "white";
                    }}
                  >
                    <FolderIcon sx={{
                      fontSize: 36,
                      color: carpeta === siglaCurso.toUpperCase() ? "#4A6D8C" : "#8daecb",
                    }} />
                    <Typography variant="caption" sx={{
                      fontWeight: carpeta === siglaCurso.toUpperCase() ? 700 : 500,
                      color: carpeta === siglaCurso.toUpperCase() ? "#4A6D8C" : "#374151",
                      textAlign: "center", wordBreak: "break-all",
                    }}>
                      {carpeta}
                    </Typography>
                  </button>
                ))}
              </div>
            )}

            {/* Vista imágenes */}
            {!cargando && vista === "imagenes" && imagenes.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 12,
                maxHeight: 400,
                overflowY: "auto",
                paddingRight: 4,
              }}>
                {imagenes.map((imgUrl) => {
                  const nombre   = imgUrl.split("/").pop() ?? "";
                  const selected = seleccionada === imgUrl;
                  return (
                    <div key={imgUrl} onClick={() => setSeleccionada(selected ? null : imgUrl)}
                      style={{
                        borderRadius: 10, overflow: "hidden", cursor: "pointer",
                        border: selected ? "3px solid #4A6D8C" : "2px solid #e2e8f0",
                        background: "#f8fafc", transition: "border-color 0.15s, box-shadow 0.15s",
                        boxShadow: selected ? "0 0 0 2px #6793ba44" : "none",
                      }}>
                      <div style={{
                        height: 150, display: "flex", alignItems: "center",
                        justifyContent: "center", overflow: "hidden", background: "#f0f4f8",
                      }}>
                        <img src={imgUrl} alt={nombre} loading="lazy"
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div style={{
                        padding: "6px 8px", borderTop: "1px solid #e2e8f0",
                        background: selected ? "#e8f0f8" : "white",
                      }}>
                        <Typography variant="caption" title={nombre} sx={{
                          color: selected ? "#4A6D8C" : "#64748b",
                          fontWeight: selected ? 600 : 400,
                          display: "block", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {nombre}
                        </Typography>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="text" sx={{ color: "#6793ba", borderRadius: 2 }}>
          Cancelar
        </Button>
        {tab === 0 && (
          <Button onClick={handleConfirmUrl} variant="contained" disabled={!url.trim()}
            sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
              boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
            Insertar
          </Button>
        )}
        {tab === 1 && (
          <Button onClick={handleConfirmGaleria} variant="contained" disabled={!seleccionada}
            sx={{ bgcolor: "#4A6D8C", borderRadius: 2, px: 3, fontWeight: 600,
              boxShadow: "none", "&:hover": { bgcolor: "#3c5770", boxShadow: "none" } }}>
            Insertar imagen seleccionada
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};