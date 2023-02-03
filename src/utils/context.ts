import {Api, Organization, User, UserSession} from "api/sdk"
import {createContext} from "react"

export interface AuthContextType {
  session: UserSession
  logout: () => void
  currentUser: User
  setCurrentUser: (newCurrentUser: User) => void
  currentOrganization: Organization
  mode: "light" | "dark"
  setMode: (newMode: "light" | "dark") => void
  color: string
  setColor: (newColor: string) => void
}

export interface UnauthContextType {
  api: Api
  authenticate: (userToken: string) => void
  changeBackendURL: (backendURL: string) => void
}

// AuthContext is available when the user is authenticated
export const AuthContext = createContext({} as AuthContextType)

// UnauthContext is available when the user is not authenticated (login screen)
export const UnauthContext = createContext({} as UnauthContextType)
