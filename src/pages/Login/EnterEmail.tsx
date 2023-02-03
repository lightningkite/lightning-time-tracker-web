import {LoadingButton} from "@mui/lab"
import {Alert, Stack, TextField, Typography} from "@mui/material"
import React, {FC, useEffect, useState} from "react"

export interface EnterEmailProps {
  email: string
  setEmail: (email: string) => void
  sendEmail: () => Promise<void>
}

const EnterEmail: FC<EnterEmailProps> = (props) => {
  const {email, setEmail, sendEmail} = props

  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Remove whitespace and convert to lowercase
    if (/\s/.test(email) || /[A-Z]/.test(email)) {
      setEmail(email.replace(/\s/g, "").toLowerCase())
    }
  }, [email])

  const onSubmit = () => {
    setError("")

    if (email.length === 0) {
      setError("Please enter an email address")
      return
    }

    if (
      !email
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) {
      setError("Email address is invalid")
      return
    }

    setSubmitting(true)

    sendEmail()
      .catch(() => setError("Error sending email"))
      .finally(() => setSubmitting(false))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Typography variant="h1" textAlign="center">
        Lightning Tracker
      </Typography>
      <Typography variant="subtitle1" lineHeight={1.2} mt={3}>
        We&apos;ll send you a code to sign in and get started!
      </Typography>

      <Stack spacing={4} mt={4}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          fullWidth
          autoFocus
        />

        {!!error && <Alert severity="error">{error}</Alert>}

        <LoadingButton
          variant="contained"
          color="primary"
          fullWidth
          loading={submitting}
          type="submit"
        >
          Send Code
        </LoadingButton>
      </Stack>
    </form>
  )
}

export default EnterEmail
