const DEFAULT_API_BASE_URL = "http://localhost:3001";

export function getApiBaseUrl() {
  return (import.meta as any).env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token");
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAuthToken();

  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in (data as any)
        ? String((data as any).error)
        : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

