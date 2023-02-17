import {colors, createTheme, CssBaseline, ThemeProvider} from "@mui/material"
import {LocalizationProvider} from "@mui/x-date-pickers"
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import {Organization, referentialSchema, User} from "api/sdk"
import {useSessionManager} from "api/useSessionManager"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import MainLayout from "layouts/MainLayout"
import UnauthLayout from "layouts/UnauthLayout"
import React, {FC, useEffect, useState} from "react"
import {BrowserRouter} from "react-router-dom"
import {AuthRoutes, UnauthRoutes} from "routers"
import {theme} from "theme"
import {AnnotatedEndpointContextProvider} from "utils/AnnotatedEndpointProvider"
import {AuthContext, TimerContextProvider, UnauthContext} from "utils/context"
import {parsePreferences} from "utils/helpers"

const App: FC = () => {
  const {api, changeBackendURL, session, authenticate, logout} =
    useSessionManager()

  const [currentUser, setCurrentUser] = useState<User | null>()
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>()

  const isLoggedIn = !!session

  useEffect(() => {
    if (!session) {
      setCurrentUser(undefined)
      return
    }

    session.auth
      .getSelf()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
  }, [isLoggedIn])

  useEffect(() => {
    if (!session || !currentUser) {
      setCurrentOrganization(undefined)
      return
    }

    session.organization
      .detail(currentUser.organization)
      .then(setCurrentOrganization)
      .catch(() => setCurrentOrganization(null))
  }, [currentUser])

  if (
    isLoggedIn &&
    (currentUser === undefined || currentOrganization === undefined)
  ) {
    return <Loading />
  }

  if (currentUser === null) {
    return <ErrorAlert>Error loading current user</ErrorAlert>
  }

  if (currentOrganization === null) {
    return <ErrorAlert>Error loading current organization</ErrorAlert>
  }

  const preferences = parsePreferences(currentUser?.webPreferences)

  return (
    <ThemeProvider
      theme={createTheme({
        ...theme,
        palette: {
          mode: preferences.mode ?? "dark",
          primary: {
            main: (colors as any)[preferences.color ?? "lightBlue"][500]
          }
        }
      })}
    >
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          {session && currentUser && currentOrganization ? (
            <AuthContext.Provider
              value={{
                session,
                logout,
                currentUser,
                setCurrentUser,
                currentOrganization
              }}
            >
              <AnnotatedEndpointContextProvider
                session={session}
                referentialSchema={referentialSchema}
              >
                <TimerContextProvider>
                  <MainLayout>
                    <AuthRoutes />
                  </MainLayout>
                </TimerContextProvider>
              </AnnotatedEndpointContextProvider>
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
