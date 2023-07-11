import {createTheme, CssBaseline, ThemeProvider} from "@mui/material"
import {LocalizationProvider} from "@mui/x-date-pickers"
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import {Organization, User, UserSession} from "api/sdk"
import {useSessionManager} from "api/useSessionManager"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import MainLayout from "layouts/MainLayout"
import UnauthLayout from "layouts/UnauthLayout"
import React, {FC, useEffect, useReducer} from "react"
import {BrowserRouter} from "react-router-dom"
import {AuthRoutes, UnauthRoutes} from "routers"
import {theme} from "theme"
import {AuthContext, TimerContextProvider, UnauthContext} from "utils/context"
import {parsePreferences} from "utils/helpers"

const App: FC = () => {
  const {api, changeBackendURL, session, authenticate} = useSessionManager()

  const [state, dispatch] = useReducer(reducer, {
    status: !!session ? "loading" : "unauthenticated"
  })

  async function loadUserData() {
    if (!session) {
      dispatch({type: "unauthenticated"})
      return
    }

    const currentUser = await session.auth.getSelf()
    const [currentOrganization, activeUsers] = await Promise.all([
      session.organization.detail(currentUser.organization),
      session.user.query({
        condition: {organization: {Equal: currentUser.organization}},
        limit: 10_000
      })
    ])

    dispatch({
      type: "authenticated",
      session,
      currentUser,
      currentOrganization,
      activeUsers,
      userColors: activeUsers.reduce<Record<string, string>>((acc, user) => {
        acc[user._id] = parsePreferences(user.webPreferences).themeColor
        return acc
      }, {})
    })
  }

  useEffect(() => {
    loadUserData().catch(() => dispatch({type: "error"}))
  }, [session])

  if (state.status === "loading") {
    return <Loading />
  }

  if (state.status === "error") {
    return <ErrorAlert>Error loading current user information</ErrorAlert>
  }

  const preferences = parsePreferences(
    state.status === "authenticated" ? state.currentUser.webPreferences : null
  )

  return (
    <ThemeProvider
      theme={createTheme({
        ...theme,
        palette: {
          mode: preferences.mode,
          primary: {main: preferences.themeColor}
        }
      })}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          {state.status === "authenticated" ? (
            <AuthContext.Provider
              value={{
                ...state,
                setCurrentUser: (newUser) =>
                  dispatch({type: "setCurrentUser", newUser})
              }}
            >
              <TimerContextProvider>
                <MainLayout>
                  <AuthRoutes />
                </MainLayout>
              </TimerContextProvider>
            </AuthContext.Provider>
          ) : (
            <UnauthContext.Provider
              value={{api, changeBackendURL, authenticate}}
            >
              <UnauthLayout>
                <UnauthRoutes />
              </UnauthLayout>
            </UnauthContext.Provider>
          )}
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App

type State =
  | {status: "error"}
  | {status: "unauthenticated"}
  | {status: "loading"}
  | {
      status: "authenticated"
      session: UserSession
      currentUser: User
      currentOrganization: Organization
      activeUsers: User[]
      userColors: Record<string, string>
    }

type Action =
  | {type: "error" | "unauthenticated" | "loading"}
  | {type: "setCurrentUser"; newUser: User}
  | {
      type: "authenticated"
      session: UserSession
      currentUser: User
      currentOrganization: Organization
      activeUsers: User[]
      userColors: Record<string, string>
    }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "unauthenticated":
      return {status: "unauthenticated"}
    case "error":
      return {status: "error"}
    case "loading":
      return {status: "loading"}
    case "setCurrentUser":
      if (state.status !== "authenticated") {
        return state
      }
      return {
        ...state,
        currentUser: action.newUser
      }
    case "authenticated":
      return {
        status: "authenticated",
        ...action
      }
  }
}
