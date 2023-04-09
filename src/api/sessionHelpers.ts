import {LocalStorageKey} from "utils/constants"
import {UserSession} from "./sdk"

export interface URLOption {
  url: string
  label: string
}

export const backendURLOptions: URLOption[] = [
  {
    label: "Prod",
    url: "https://time.cs.lightningkite.com"
  }
]

const envBackendURL = import.meta.env.VITE_BACKEND_HTTP_URL
if (envBackendURL && !backendURLOptions.some((o) => o.url === envBackendURL)) {
  backendURLOptions.push({label: "Custom Env Default", url: envBackendURL})
}

export function logout(): void {
  localStorage.removeItem(LocalStorageKey.USER_TOKEN)
  window.location.href = "/"
}

export async function refreshJWT(session: UserSession) {
  try {
    if (!session) return

    const newJWT = await session.auth.refreshToken()
    localStorage.setItem(LocalStorageKey.USER_TOKEN, newJWT)

    const url = new URL(window.location.href)
    url.searchParams.delete("jwt")
    window.history.replaceState({}, "", url.toString())
  } catch {
    logout()
  }
}
