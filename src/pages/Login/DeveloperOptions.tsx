import {
  Alert,
  AlertTitle,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography
} from "@mui/material"
import type {MockApi} from "api/mockApi"
import type {LiveApi} from "api/sdk"
import type {FC} from "react"
import React, {useContext} from "react"
import {UnauthContext} from "utils/context"

export const DEVELOPER_SECRET_CODE = "info@lightningkite.com"

const envBackendURL = import.meta.env.VITE_BACKEND_HTTP_URL

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

if (envBackendURL && !backendURLOptions.some((o) => o.url === envBackendURL)) {
  backendURLOptions.push({label: "Custom Env Default", url: envBackendURL})
}

const DeveloperOptions: FC = () => {
  const {changeBackendURL, api} = useContext(UnauthContext)

  const selectedBackendURL = (api as LiveApi | MockApi).httpUrl
  const isUsingCustomBackendURL = selectedBackendURL !== envBackendURL

  return (
    <Box sx={{textAlign: "left"}}>
      <Divider sx={{my: 2}} />
      <Typography variant="h3">Developer Settings</Typography>
      <Typography variant="subtitle2" lineHeight={1.2}>
        These options are only shown by default in local development. To show
        this in production, enter the secret code in the email field:{" "}
        <u>{DEVELOPER_SECRET_CODE}</u>
      </Typography>

      {isUsingCustomBackendURL && (
        <Alert severity="info" sx={{mt: 2}}>
          <AlertTitle>Custom Backend URL Selected</AlertTitle>
          You have selected different backend URL than the env variable set for
          this deployment.
        </Alert>
      )}

      <FormControl sx={{mt: 2}}>
        <FormLabel>Backend HTTP URL</FormLabel>
        <RadioGroup
          value={selectedBackendURL}
          onChange={(e) => changeBackendURL(e.target.value)}
          sx={{gap: 1, mt: 1}}
        >
          {backendURLOptions.map((option) => (
            <FormControlLabel
              key={option.url}
              value={option.url}
              control={<Radio />}
              label={
                <Stack>
                  <Typography fontWeight="bold" lineHeight={1}>
                    {option.label}
                    {option.url === envBackendURL && " *"}
                  </Typography>
                  <Typography variant="body2" lineHeight={1} mt="5px">
                    {option.url}
                  </Typography>
                </Stack>
              }
            />
          ))}
          <FormControlLabel
            value="mock"
            control={<Radio />}
            label={
              <Typography fontWeight="bold" lineHeight={1}>
                Mock API
              </Typography>
            }
          />
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

export default DeveloperOptions
