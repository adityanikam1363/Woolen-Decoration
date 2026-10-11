const API_BASE = "/api"

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })
  const result = (await response.json().catch(() => ({}))) as {
    error?: string
  } & T
  if (!response.ok) {
    const error = new Error(
      result.error || `Request failed (${response.status})`,
    ) as Error & { status: number }
    error.status = response.status
    throw error
  }
  return result
}
