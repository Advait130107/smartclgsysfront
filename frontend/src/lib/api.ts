const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit & { formData?: FormData } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let body = options.body;
  if (options.formData) {
    body = options.formData;
  } else if (body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export function uploadUrl(fileName: string) {
  return `${API_URL}/uploads/${fileName}`;
}
