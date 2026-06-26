// src/helpers/logger.ts
//
// Logger único para reemplazar los console.* dispersos por el proyecto.
//
//   - En desarrollo (import.meta.env.DEV): imprime todo.
//   - En producción: silencia debug / info / log; deja pasar warn y error
//     (los errores reales sí importan en prod).
//
// Uso:
//   import { logger } from "@/helpers/logger";
//   logger.debug("valor", x);
//   logger.error(error);
//
//   // Con prefijo de contexto (útil en plugins/servicios):
//   import { createLogger } from "@/helpers/logger";
//   const log = createLogger("MathPlugin");
//   log.debug("..."); // → [MathPlugin] ...
//
// Migración gradual (a medida que se toca cada archivo):
//   console.log(x)        → logger.debug(x)
//   )    → logger.error(error)   // en bloques catch
//   console.warn(x)       → logger.warn(x)
//   console.error(x)      → logger.error(x)
//
// Más adelante (Fase D) este módulo es el punto natural para enganchar el
// sistema de notificación global: logger.error podría además emitir un toast.

const isDev = import.meta.env.DEV;

type LogArgs = unknown[];

export interface Logger {
  debug: (...args: LogArgs) => void;
  info: (...args: LogArgs) => void;
  log: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
}

function build(prefix?: string): Logger {
  const tag: LogArgs = prefix ? [`[${prefix}]`] : [];
  return {
    debug: (...args) => {
      if (isDev) console.debug(...tag, ...args);
    },
    info: (...args) => {
      if (isDev) console.info(...tag, ...args);
    },
    log: (...args) => {
      if (isDev) console.log(...tag, ...args);
    },
    warn: (...args) => {
      console.warn(...tag, ...args);
    },
    error: (...args) => {
      console.error(...tag, ...args);
    },
  };
}

export const logger = build();

export const createLogger = (scope: string): Logger => build(scope);

export default logger;