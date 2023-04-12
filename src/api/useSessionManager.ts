import {useEffect, useState} from "react"
import {LocalStorageKey} from "utils/constants"
import {MockApi} from "./mockApi"
import {Api, LiveApi, UserSession} from "./sdk"

interface UseSessionManagerReturn {
  api: Api
  changeBackendURL: (backendURL: string) => void
  session: UserSession | null
  authenticate: (userToken: string) => void
}

export const useSessionManager = (): UseSessionManagerReturn => {
  const [api, setApi] = useState(getInitialApi)
  const [session, setSession] = useState(getInitialSession(api))

  // Refresh the user token on initial page load to keep it from expiring
  useEffect(() => {
    session?.auth.refreshToken().then(changeToken).catch(logout)
  }, [])

  // Update the backend URL in local storage when it changes
  useEffect(() => {
    const backendURL = "httpUrl" in api ? api.httpUrl : "mock"
    localStorage.setItem(LocalStorageKey.BACKEND_URL, backendURL)
  }, [api])

  // Update the user token in local storage when it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(LocalStorageKey.USER_TOKEN, session.userToken)
    } else {
      localStorage.removeItem(LocalStorageKey.USER_TOKEN)
    }
  }, [session])

  function changeToken(userToken: string) {
    const url = new URL(window.location.href)

    if (url.searchParams.get("jwt")) {
      url.searchParams.delete("jwt")
      window.history.replaceState({}, "", url.toString())
    }

    setSession(new UserSession(api, userToken))
  }

  function changeBackendURL(backendURL: string) {
    setApi(backendURL === "mock" ? new MockApi() : new LiveApi(backendURL))
  }

  return {
    api,
    changeBackendURL,
    session,
    authenticate: changeToken
  }
}

function getInitialApi(): LiveApi | MockApi {
  const localStorageBackendURL = localStorage.getItem(
    LocalStorageKey.BACKEND_URL
  )

  const initialBackendURL =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    localStorageBackendURL || import.meta.env.VITE_BACKEND_HTTP_URL || "mock"

  return initialBackendURL === "mock"
    ? new MockApi()
    : new LiveApi(initialBackendURL)
}

function getInitialSession(api: LiveApi | MockApi): UserSession | null {
  const localStorageToken =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    localStorage.getItem(LocalStorageKey.USER_TOKEN) || undefined

  const url = new URL(window.location.href)
  const searchParamsJwt = url.searchParams.get("jwt")

  const tokenToUse = localStorageToken ?? searchParamsJwt
  return tokenToUse ? new UserSession(api, tokenToUse) : null
}

export function logout(): void {
  localStorage.removeItem(LocalStorageKey.USER_TOKEN)
  window.location.reload()
}
