const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiRequestError extends Error {
  status: number;
  method: string;
  path: string;

  constructor(message: string, status: number, method: string, path: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.method = method;
    this.path = path;
  }
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401;
}

export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 403;
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("token");
  window.location.href = "/login";
}

// Keep user-facing messages clean: never surface a raw response body (JSON/HTML)
// or an oversized string. Fall back to a friendly, status-based message.
function friendlyMessage(raw: unknown, status: number): string {
  const fallback =
    status === 401
      ? "Your session has expired. Please log in again."
      : status === 403
        ? "You don't have permission to do that."
        : status === 404
          ? "We couldn't find what you were looking for."
          : status >= 500
            ? "Something went wrong on our end. Please try again."
            : "Request failed. Please try again.";

  if (typeof raw !== "string") {
    return fallback;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 200 || /^[[{<]/.test(trimmed)) {
    return fallback;
  }
  return trimmed;
}

async function parseResponse<T>(response: Response, method: string, path: string): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { message?: string; error?: string };

  if (!response.ok) {
    throw new ApiRequestError(
      friendlyMessage(data.message ?? data.error, response.status),
      response.status,
      method,
      path
    );
  }

  return data;
}

async function refreshAccessToken(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      localStorage.removeItem("token");
      return false;
    }

    const data = (await response.json()) as { accessToken?: string };
    if (!data.accessToken) {
      localStorage.removeItem("token");
      return false;
    }

    localStorage.setItem("token", data.accessToken);
    return true;
  } catch {
    localStorage.removeItem("token");
    return false;
  }
}

async function apiRequest<T>(method: ApiMethod, path: string, body?: unknown, retryAuth = true): Promise<T> {
  const headers = getAuthHeaders();

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (response.status === 401 && retryAuth && path !== "/auth/refresh" && (await refreshAccessToken())) {
    return apiRequest<T>(method, path, body, false);
  }

  return parseResponse<T>(response, method, path);
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>("GET", path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>("POST", path, body);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>("PATCH", path, body);
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>("DELETE", path);
}
