// src/helpers/fetchLti.ts
// Fetch para rutas /api/lti — usa el JWT LTI guardado en memoria (no Redux).
// El token llega por URL (?token=...) al abrir el iframe desde Canvas.

const baseUrl = import.meta.env.VITE_BACKEND_URL;

let ltiToken: string | null = null;

export const setLtiToken = (token: string): void => {
  ltiToken = token;
};

export const getLtiToken = (): string | null => ltiToken;

export const fetchLti = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: Record<string, unknown>,
): Promise<Response> => {
  const url = `${baseUrl}/${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (ltiToken) {
    headers["Authorization"] = `Bearer ${ltiToken}`;
  }

  const config: RequestInit = { method, headers };
  if (method !== "GET" && data) {
    config.body = JSON.stringify(data);
  }

  return fetch(url, config);
};