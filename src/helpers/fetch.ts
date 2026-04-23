// ============================================================================
// FETCH HELPERS - CON JWT AUTHENTICATION
// ============================================================================

const baseUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * Obtener token JWT desde sessionStorage
 */
const getAuthToken = (): string | null => {
  return sessionStorage.getItem("lti_token");
};

/**
 * Fetch CON autenticación JWT
 * Se usa para TODAS las llamadas a /api/*
 */
export const fetchWithJWT = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data?: Record<string, unknown>,
) => {
  const url = `${baseUrl}/${endpoint}`;
  const token = getAuthToken();

  if (!token) {
    console.error("❌ No JWT token found in sessionStorage");
    throw new Error(
      "No authentication token. Please login through Canvas LTI.",
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log("📡 Fetch with JWT:", method, endpoint);

  const config: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET" && data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      console.error("❌ JWT token expirado o inválido");
      // Limpiar token inválido
      sessionStorage.removeItem("lti_token");
      throw new Error("Session expired. Please reload from Canvas.");
    }

    return response;
  } catch (error) {
    console.error("❌ Error en fetch:", error);
    throw error;
  }
};

/**
 * Helpers específicos para GET/POST/PUT/DELETE
 */
export const fetchCanvas = (
  endpoint: string,
  data?: Record<string, unknown>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
) => {
  return fetchWithJWT(endpoint, method, data);
};

export const fetchConToken = (
  endpoint: string,
  data?: Record<string, unknown>,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
) => {
  return fetchWithJWT(endpoint, method, data);
};

// Mantener compatibilidad con código existente
export const fetchSinToken = (
  endpoint: string,
  data?: Record<string, unknown>,
  method = "GET",
) => {
  const url = `${baseUrl}/${endpoint}`;

  if (method === "GET") {
    return fetch(url);
  } else {
    return fetch(url, {
      method,
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
};

/**
 * Verificar si hay sesión JWT válida
 */
export const hasValidSession = (): boolean => {
  const token = getAuthToken();
  return token !== null && token.length > 0;
};

/**
 * Obtener datos del usuario desde sessionStorage (solo para debug)
 * NOTA: No confiar en estos datos para seguridad, solo el backend valida el JWT
 */
export const getUserDataFromSession = () => {
  return {
    userId: sessionStorage.getItem("lti_user_id"),
    courseId: sessionStorage.getItem("lti_course_id"),
  };
};

/**
 * Cerrar sesión (limpiar tokens)
 */
export const logout = () => {
  sessionStorage.removeItem("lti_token");
  sessionStorage.removeItem("lti_user_id");
  sessionStorage.removeItem("lti_course_id");
  console.log("✅ Sesión cerrada");
};
