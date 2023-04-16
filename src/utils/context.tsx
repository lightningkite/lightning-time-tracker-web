import {Api, Organization, Timer, User, UserSession} from "api/sdk"
import {useGlobalTimerManager} from "hooks/useGlobalTimerManager"
import React, {createContext, FC, ReactElement} from "react"

export interface AuthContextType {
  session: UserSession
  currentUser: User
  setCurrentUser: (newCurrentUser: User) => void
  currentOrganization: Organization
}

export interface UnauthContextType {
  api: Api
  authenticate: (userToken: string) => void
  changeBackendURL: (backendURL: string) => void
}

export interface TimerContextType {
  timers: Timer[] | undefined
  removeTimer: (key: string) => void
  updateTimer: (key: string, updates: Partial<Timer>) => void
  toggleTimer: (key: string) => void
  newTimer: (initialValues?: Pick<Timer, "task" | "project">) => string
  submitTimer: (key: string) => Promise<void>
}

// AuthContext is available when the user is authenticated
export const AuthContext = createContext({} as AuthContextType)

// UnauthContext is available when the user is not authenticated (login screen)
export const UnauthContext = createContext({} as UnauthContextType)

export const TimerContext = createContext({} as TimerContextType)

export const TimerContextProvider: FC<{children: ReactElement}> = (props) => (
  <TimerContext.Provider value={useGlobalTimerManager()}>
    {props.children}
  </TimerContext.Provider>
)
