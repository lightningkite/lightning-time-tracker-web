import {useQueryParams} from "hooks/useQueryParams"
import {useState} from "react"
import {LocalStorageKey} from "utils/constants"
import {MockApi} from "./mockApi"
import {Api, LiveApi, UserSession} from "./sdk"

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

export const useSessionManager = (): {
  api: Api
  changeBackendURL: (backendURL: string) => void
  session: UserSession | null
  authenticate: (userToken: string) => void
  logout: () => void
} => {
  const {jwt: queryJWT} = useQueryParams()

  const [api, setApi] = useState<Api>(() => {
    const localStorageBackendURL = localStorage.getItem(
      LocalStorageKey.BACKEND_URL
    )

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const initialBackendURL = localStorageBackendURL || envBackendURL || "mock"

    if (localStorageBackendURL !== initialBackendURL) {
      localStorage.setItem(LocalStorageKey.BACKEND_URL, initialBackendURL)
    }

    if (initialBackendURL === "mock") return new MockApi()
    return new LiveApi(initialBackendURL)
  })

  // Null if not logged in, a session if logged in
  const [session, setSession] = useState<UserSession | null>(() => {
    const localStorageToken = localStorage.getItem(LocalStorageKey.USER_TOKEN)
    if (!localStorageToken && queryJWT) {
      localStorage.setItem(LocalStorageKey.USER_TOKEN, queryJWT)
    }

    const token = localStorageToken ?? queryJWT

    if (token) {
      const newSession = new UserSession(api, token)
      refreshJWT(newSession)
      return newSession
    }
    return null
  })

  function authenticate(userToken: string) {
    setSession(new UserSession(api, userToken))
    localStorage.setItem(LocalStorageKey.USER_TOKEN, userToken)
  }

  function changeBackendURL(backendURL: string) {
    localStorage.setItem(LocalStorageKey.BACKEND_URL, backendURL)
    if (backendURL === "mock") {
      setApi(new MockApi())
    } else {
      setApi(new LiveApi(backendURL))
    }
  }

  return {
    api,
    changeBackendURL,
    session,
    authenticate,
    logout
  }
}

export function logout(): void {
  localStorage.removeItem(LocalStorageKey.USER_TOKEN)
  window.location.href = "/"
}

async function refreshJWT(session: UserSession) {
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
