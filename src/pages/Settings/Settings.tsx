import {DarkMode, LightMode} from "@mui/icons-material"
import {
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography
} from "@mui/material"
import FormSection from "components/FormSection"
import PageHeader from "components/PageHeader"
import {UserForm} from "components/UserForm"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"
import {parsePreferences} from "utils/helpers"
import {ColorPicker} from "./ColorPicker"

export interface WebPreferences {
  mode: "light" | "dark"
  color: string
  colorBrightness: number
  summaryTime: "day" | "week"
}

const Settings: FC = () => {
  const {logout, currentUser, setCurrentUser, session} = useContext(AuthContext)
  const permissions = usePermissions()

  const preferences = parsePreferences(currentUser?.webPreferences)

  const updatePreferences = (
    newPartialPreferences: Partial<WebPreferences>
  ) => {
    const previousPreferences = structuredClone(preferences)

    const newPreferencesJSON = JSON.stringify({
      ...preferences,
      ...newPartialPreferences
    })

    // Optimistically update the UI
    setCurrentUser({
      ...currentUser,
      webPreferences: newPreferencesJSON
    })

    session.user
      .modify(currentUser._id, {webPreferences: {Assign: newPreferencesJSON}})
      .then(setCurrentUser)
      .catch(() =>
        // If the update fails, revert the UI
        setCurrentUser({
          ...currentUser,
          webPreferences: JSON.stringify(previousPreferences)
        })
      )
  }

  return (
    <Container maxWidth="md">
      <PageHeader title="Settings">
        <Button variant="contained" onClick={logout}>
          Logout
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <UserForm user={currentUser} setUser={setCurrentUser} />
        </CardContent>
      </Card>

      {permissions.timeEntries && (
        <>
          <Typography variant="h2" sx={{mb: 2, mt: 4}}>
            Application Settings
          </Typography>

          <Card>
            <CardContent>
              <FormSection disableTopPadding>
                <FormControl>
                  <FormLabel>Summarize Time</FormLabel>
                  <FormHelperText sx={{ml: 0}}>
                    Choose the time period to show the total time for in the
                    menu bar
                  </FormHelperText>
                  <RadioGroup
                    value={preferences.summaryTime}
                    onChange={(e) =>
                      updatePreferences({
                        summaryTime: e.target.value as "day" | "week"
                      })
                    }
                  >
                    <FormControlLabel
                      value="day"
                      control={<Radio />}
                      label="Today"
                    />
                    <FormControlLabel
                      value="week"
                      control={<Radio />}
                      label="This Week"
                    />
                  </RadioGroup>
                </FormControl>
              </FormSection>
            </CardContent>
          </Card>
        </>
      )}

      <Typography variant="h2" sx={{mb: 2, mt: 4}}>
        Theme
      </Typography>

      <Card>
        <CardContent>
          <FormSection disableTopPadding>
            <Button
              variant="outlined"
              onClick={() =>
                updatePreferences({
                  mode: preferences.mode === "dark" ? "light" : "dark"
                })
              }
              startIcon={
                preferences.mode === "light" ? <LightMode /> : <DarkMode />
              }
              sx={{alignSelf: "flex-start"}}
            >
              {preferences.mode} Mode
            </Button>

            <ColorPicker
              preferences={preferences}
              updatePreferences={updatePreferences}
            />
          </FormSection>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Settings
