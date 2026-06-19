import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { chapter } from "../../../db/db";

interface Paso {
  msg: string;
  status: "ok" | "error" | "info" | "working";
}

interface Props {
  curso_id: string;
  canvas_curso_id: number;
  canvas_nombre: string;
  onClose: () => void;
}

const ModalSincronizar = ({
  curso_id,
  canvas_curso_id,
  canvas_nombre,
  onClose,
}: Props) => {
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0, msg: "" });
  const [terminado, setTerminado] = useState(false);
  const [exitoso, setExitoso] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleIniciar = () => {
    setIniciado(true);
    setPasos([]);
    setProgreso({ actual: 0, total: 0, msg: "" });
    setTerminado(false);

    const token = sessionStorage.getItem("auth_token");
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/sincronizar/${curso_id}/${canvas_curso_id}?token=${token}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.tipo === "paso") {
        setPasos((prev) => [...prev, { msg: data.msg, status: data.status }]);
        // Auto scroll
        setTimeout(() => {
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 50);
      }

      if (data.tipo === "progreso") {
        setProgreso({ actual: data.actual, total: data.total, msg: data.msg });
      }

      if (data.tipo === "fin") {
        setTerminado(true);
        setExitoso(data.ok);
        setPasos((prev) => [
          ...prev,
          {
            msg: data.msg,
            status: data.ok ? "ok" : "error",
          },
        ]);
        es.close();
      }
    };

    es.onerror = () => {
      setTerminado(true);
      setExitoso(false);
      setPasos((prev) => [
        ...prev,
        {
          msg: "Error de conexión con el servidor",
          status: "error",
        },
      ]);
      es.close();
    };
  };

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const iconPaso = (status: Paso["status"]) => {
    if (status === "ok")
      return <CheckCircleIcon sx={{ fontSize: 14, color: "#1a9e5c" }} />;
    if (status === "error")
      return <ErrorIcon sx={{ fontSize: 14, color: "#ef4444" }} />;
    if (status === "working")
      return (
        <AutorenewIcon
          sx={{
            fontSize: 14,
            color: "#f59e0b",
            animation: "spin 1s linear infinite",
          }}
        />
      );
    return <InfoIcon sx={{ fontSize: 14, color: "#6793ba" }} />;
  };

  const porcentaje =
    progreso.total > 0
      ? Math.round((progreso.actual / progreso.total) * 100)
      : 0;

  return (
    <Dialog
      open
      onClose={terminado ? onClose : undefined}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#4A6D8C",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
        }}
      >
        <SyncIcon />
        <div>
          <div>Sincronizar contenido</div>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {canvas_nombre}
          </Typography>
        </div>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* ── Progreso general ── */}
        {iniciado && progreso.total > 0 && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex justify-between mb-1">
              <Typography variant="caption" sx={{ color: "#6793ba" }}>
                {progreso.msg}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6793ba" }}>
                {progreso.actual}/{progreso.total} {chapter.pluralName}
              </Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={porcentaje}
              sx={{
                borderRadius: 4,
                height: 6,
                bgcolor: "#f0f4f8",
                "& .MuiLinearProgress-bar": { bgcolor: "#4A6D8C" },
              }}
            />
          </div>
        )}

        {/* ── Intro ── */}
        {!iniciado && (
          <div className="px-6 py-6">
            <Typography variant="body2" sx={{ color: "#3d3d3d", mb: 2 }}>
              Esta operación sincronizará todo el contenido del curso al curso
              Canvas seleccionado:
            </Typography>
            <div className="flex flex-col gap-1.5">
              {[
                `Módulos por ${chapter.name}`,
                "Páginas de diapositivas y videos",
                "Quizzes con preguntas",
                "Ayudantías con soluciones, videos y quizzes",
                "Ejercicios",
                "Páginas HTML de clases, ayudantías y ejercicios",
                `Índice general de ${chapter.pluralName}`,
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4A6D8C",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#555" }}>
                    {item}
                  </Typography>
                </div>
              ))}
            </div>
            <Typography
              variant="caption"
              sx={{ color: "#f59e0b", mt: 2, display: "block" }}
            >
              ⚠ Este proceso puede tomar varios minutos dependiendo del
              contenido.
            </Typography>
          </div>
        )}

        {/* ── Lista de pasos ── */}
        {iniciado && (
          <div
            ref={listRef}
            style={{
              maxHeight: 400,
              overflowY: "auto",
              padding: "12px 24px",
            }}
          >
            {pasos.map((paso, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 py-1.5"
                style={{ borderBottom: "1px solid #f0f0f0" }}
              >
                <div className="mt-0.5 shrink-0">{iconPaso(paso.status)}</div>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      paso.status === "error"
                        ? "#ef4444"
                        : paso.status === "ok"
                          ? "#1a9e5c"
                          : paso.status === "working"
                            ? "#f59e0b"
                            : "#555",
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    lineHeight: 1.5,
                  }}
                >
                  {paso.msg}
                </Typography>
              </div>
            ))}

            {/* Loading indicator */}
            {!terminado && (
              <div className="flex items-center gap-2 py-2">
                <AutorenewIcon
                  sx={{
                    fontSize: 14,
                    color: "#f59e0b",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#f59e0b", fontFamily: "monospace" }}
                >
                  Sincronizando...
                </Typography>
              </div>
            )}
          </div>
        )}

        {/* ── Resultado final ── */}
        {terminado && (
          <div
            className="mx-6 mb-4 rounded-xl p-4 flex items-center gap-3"
            style={{
              background: exitoso ? "#d1fae5" : "#fee2e2",
              border: `1px solid ${exitoso ? "#6ee7b7" : "#fca5a5"}`,
            }}
          >
            {exitoso ? (
              <CheckCircleIcon sx={{ color: "#1a9e5c", fontSize: 20 }} />
            ) : (
              <ErrorIcon sx={{ color: "#ef4444", fontSize: 20 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: exitoso ? "#065f46" : "#991b1b",
                fontWeight: 500,
              }}
            >
              {exitoso
                ? "Sincronización completada exitosamente"
                : "Sincronización completada con errores"}
            </Typography>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {!iniciado ? (
          <>
            <Button
              onClick={onClose}
              variant="text"
              sx={{ color: "#6793ba", borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleIniciar}
              variant="contained"
              startIcon={<SyncIcon />}
              sx={{
                bgcolor: "#4A6D8C",
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
              }}
            >
              Iniciar sincronización
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
            variant="contained"
            disabled={!terminado}
            sx={{
              bgcolor: "#4A6D8C",
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { bgcolor: "#3c5770", boxShadow: "none" },
            }}
          >
            {terminado ? "Cerrar" : "Sincronizando..."}
          </Button>
        )}
      </DialogActions>

      {/* Animación spin */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </Dialog>
  );
};

export default ModalSincronizar;