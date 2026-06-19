import { useNavigate } from "react-router-dom";
import { Button, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import { fetchConToken } from "../../../helpers/fetch";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import type { ICapitulo } from "../../../store/slices/capitulo";
import { useAppSelector } from "../../../store/hooks";
import { chapter } from "../../../db/db";

type HeaderProps = {
  curso_id: string | null;
  setMsgDeploy: (msg: string | null) => void;
  capitulos: ICapitulo[];
  isLoading: boolean;
};

const Header = ({
  curso_id,
  setMsgDeploy,
  capitulos,
  isLoading,
}: HeaderProps) => {
  const navigate = useNavigate();

  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);
  const { clases } = useAppSelector((s) => s.claseMongo);
  const { temas } = useAppSelector((s) => s.temaMongo);

  const [desplegando, setDesplegando] = useState(false);

  const handleDesplegarPagina = async () => {
    if (!curso_id) return;
    setDesplegando(true);
    setMsgDeploy(null);
    try {
      const resp = await fetchConToken(
        `api/admin/publicar-pagina/capitulos/${curso_id}`,
        {},
        "POST",
      );
      const body = await resp.json();
      const errores = (body.data ?? []).filter((r: { ok: boolean }) => !r.ok);
      if (errores.length > 0)
        setMsgDeploy(
          `⚠ Error al publicar en ${errores.length} curso(s) Canvas`,
        );
      else setMsgDeploy("✓ Página publicada correctamente en Canvas");
    } catch {
      setMsgDeploy("⚠ Error de conexión");
    }
    setDesplegando(false);
  };

  return (
    <div
      className="rounded-xl px-6 py-4"
      style={{ background: "#1E293B" }}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Izquierda: contexto + título */}
        <div className="min-w-0 flex-1">
          {/* Línea 1: breadcrumb + código en la misma fila */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              onClick={() => navigate("/inicio")}
              className="flex items-center gap-1 transition-colors"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              <ArrowBackIcon sx={{ fontSize: 12 }} />
              <span style={{ fontSize: 11 }}>Mis cursos</span>
            </button>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>
              /
            </span>
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {cursoActivo?.codigo}
            </span>
          </div>

          {/* Línea 2: título */}
          <Typography
            sx={{
              color: "white",
              fontFamily: "Georgia, serif",
              fontSize: "21px",
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mb: "10px",
            }}
          >
            {cursoActivo?.nombre ?? "Cargando..."}
          </Typography>

          {/* Línea 3: métricas */}
          {!isLoading && (
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {capitulos.length} {chapter.name}{capitulos.length !== 1 ? "s" : ""}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {clases.length} clase{clases.length !== 1 ? "s" : ""}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {temas.length} tema{temas.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Derecha: única acción global */}
        <Button
          variant="outlined"
          onClick={handleDesplegarPagina}
          disabled={desplegando || capitulos.length === 0}
          startIcon={
            desplegando ? (
              <CircularProgress size={13} color="inherit" />
            ) : (
              <UploadIcon sx={{ fontSize: 15 }} />
            )
          }
          sx={{
            borderColor: "rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.75)",
            borderRadius: "8px",
            px: 2,
            py: 0.85,
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "none",
            flexShrink: 0,
            whiteSpace: "nowrap",
            bgcolor: "rgba(255,255,255,0.05)",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.35)",
              bgcolor: "rgba(255,255,255,0.1)",
            },
            "&.Mui-disabled": {
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.2)",
            },
          }}
        >
          {desplegando ? "Publicando..." : "Publicar en Canvas"}
        </Button>
      </div>
    </div>
  );
};

export default Header;
