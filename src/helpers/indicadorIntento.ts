// src/helpers/indicadorIntento.ts
// Calcula el indicador visual para un quiz/ejercicio según el último intento.

export type EstadoIntento = "sin_intentos" | "aprobado" | "reprobado" | "agotado";

export interface IUltimoIntento {
  porcentaje:  number;
  completado:  boolean;
  numero:      number;
}

export interface IIndicadorIntento {
  estado:  EstadoIntento;
  icono:   string;   // emoji
  color:   string;   // color MUI
  label:   string;   // texto accesible
}

export const calcularIndicador = (
  ultimo_intento: IUltimoIntento | null | undefined,
  intentos_permitidos: number,        // 0 = ilimitados
  umbral_aprobacion: number,          // porcentaje mínimo
  total_intentos?: number,
): IIndicadorIntento => {
  // Sin intentos
  if (!ultimo_intento) {
    return { estado: "sin_intentos", icono: "", color: "#8daecb", label: "Sin intentos" };
  }

  // Aprobado
  if (ultimo_intento.completado && ultimo_intento.porcentaje >= umbral_aprobacion) {
    return { estado: "aprobado", icono: "✅", color: "#16a34a", label: `Aprobado (${ultimo_intento.porcentaje}%)` };
  }

  // Intentos agotados sin haber aprobado
  const agotado = intentos_permitidos > 0 && (total_intentos ?? ultimo_intento.numero) >= intentos_permitidos;
  if (agotado && ultimo_intento.completado) {
    return { estado: "agotado", icono: "🔒", color: "#6b7280", label: "Intentos agotados" };
  }

  // Reprobado pero con intentos disponibles
  if (ultimo_intento.completado) {
    return { estado: "reprobado", icono: "❌", color: "#dc2626", label: `Reprobado (${ultimo_intento.porcentaje}%)` };
  }

  // Intento iniciado pero no enviado
  return { estado: "sin_intentos", icono: "", color: "#8daecb", label: "En progreso" };
};