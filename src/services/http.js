// Minimal fetch wrapper for the real Node/Express backend.
// Auth is expected to use secure, httpOnly cookies (credentials: "include").
// Never store passwords or tokens in localStorage.

const BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const USE_MOCK = !BASE_URL;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  const payload = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(payload?.message ?? `Request failed (${res.status})`, res.status, payload?.details);
  return payload;
}

export const http = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
