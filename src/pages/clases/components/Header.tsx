import { Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadIcon from "@mui/icons-material/Upload";
import { useNavigate } from "react-router-dom";
import type { ICapitulo } from "../../../store/slices/capitulo";

import { fetchConToken } from "../../../helpers/fetch";
import { useAppSelector } from "../../../store/hooks";
import { useState } from "react";
import { chapter } from "../../../db/db";

// ── Tabs de navegación ────────────────────────────────────────────────────────
const TABS = [
  { label: "Clases", key: "clases" },
  { label: "Ayudantías", key: "ayudantias" },
  { label: "Ejercicios", key: "ejercicios" },
] as const;

type HeaderProps = {
  curso_id: string | null;
  capitulo: ICapitulo;
  setMsgDeploy: React.Dispatch<React.SetStateAction<string | null>>;
};

const Header = ({ curso_id, capitulo, setMsgDeploy }: HeaderProps) => {
  const navigate = useNavigate();

  const { cursoActivo } = useAppSelector((s) => s.mongoCurso);
  const { clases } = useAppSelector((s) => s.claseMongo);

  const [desplegando, setDesplegando] = useState(false);

  const handleTabNav = (key: string) => {
    if (key === "clases") return;
    if (key === "ayudantias")
      navigate(`/cursos/${curso_id}/capitulos/${capitulo._id}/ayudantias`);
    if (key === "ejercicios")
      navigate(`/cursos/${curso_id}/capitulos/${capitulo._id}/ejercicios`);
  };

  const handleDesplegarPagina = async () => {
    if (!capitulo._id) return;
    setDesplegando(true);
    setMsgDeploy(null);
    try {
      const resp = await fetchConToken(
        `api/admin/publicar-pagina/clases/${capitulo._id}`,
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
    <div className="rounded-xl px-6 py-4" style={{ background: "#1E293B" }}>
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 flex-1">
          {/* Línea 1: breadcrumb completo */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <button
              onClick={() => navigate("/inicio")}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              <ArrowBackIcon sx={{ fontSize: 11 }} /> Mis cursos
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
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>
              /
            </span>
            <button
              onClick={() => navigate(`/cursos/${curso_id}/capitulos`)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: "rgba(255,255,255,0.35)",
                fontSize: 11,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              {chapter.capitalPluralName}
            </button>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>
              /
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
              Cap. {capitulo?.position}
            </span>
          </div>

          {/* Línea 2: título del capítulo */}
          <Typography
            sx={{
              color: "white",
              fontFamily: "Georgia, serif",
              fontSize: "19px",
              fontWeight: 600,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mb: "12px",
            }}
          >
            {capitulo?.nombre ?? "Cargando..."}
          </Typography>

          {/* Tabs */}
          <div className="flex gap-1.5">
            {TABS.map((tab) => {
              const activo = tab.key === "clases";
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabNav(tab.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: 12,
                    fontWeight: activo ? 500 : 400,
                    cursor: "pointer",
                    background: activo ? "white" : "rgba(255,255,255,0.08)",
                    color: activo ? "#1E293B" : "rgba(255,255,255,0.5)",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!activo) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.14)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.75)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!activo) {
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Publicar en Canvas */}
        <Button
          variant="outlined"
          onClick={handleDesplegarPagina}
          disabled={desplegando || clases.length === 0}
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
            mt: 0.5,
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
