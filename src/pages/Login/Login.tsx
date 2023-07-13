import type {MockApi} from "api/mockApi"
import type {LiveApi} from "api/sdk"
import type {FC} from "react";
import React, { useContext, useEffect, useState} from "react"
import {UnauthContext} from "utils/context"
import DeveloperOptions, {DEVELOPER_SECRET_CODE} from "./DeveloperOptions"
import EnterEmail from "./EnterEmail"
import EnterPin from "./EnterPin"

export const Login: FC = () => {
  const {api} = useContext(UnauthContext)

  const selectedBackendURL = (api as LiveApi | MockApi).httpUrl
  const isUsingCustomBackendURL =
    selectedBackendURL !== import.meta.env.VITE_BACKEND_HTTP_URL

  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  // Show extra developer options if in local development or if using a custom backend URL
  const [showDeveloperSettings, setShowDeveloperSettings] = useState(
    isUsingCustomBackendURL || import.meta.env.DEV
  )

  const sendEmail = () =>
    api.auth.emailLoginLink(email).then(() => setIsEmailSent(true))

  useEffect(() => {
    // If the user enters this secret code, force the developer settings to show (even on production)
    if (email === DEVELOPER_SECRET_CODE) {
      setShowDeveloperSettings(true)
    }
  }, [email])

  return !isEmailSent ? (
    <>
      <EnterEmail email={email} setEmail={setEmail} sendEmail={sendEmail} />
      {showDeveloperSettings && <DeveloperOptions />}
    </>
  ) : (
    <EnterPin email={email} />
  )
}
