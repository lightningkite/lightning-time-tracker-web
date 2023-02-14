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
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"
import {ColorPicker} from "./ColorPicker"

const Settings: FC = () => {
  const {
    logout,
    applicationSettings,
    updateApplicationSettings,
    currentUser,
    setCurrentUser
  } = useContext(AuthContext)

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

      <Typography variant="h2" sx={{mb: 2, mt: 4}}>
        Application Settings
      </Typography>

      <Card>
        <CardContent>
          <FormSection disableTopPadding>
            <FormControl>
              <FormLabel>Summarize Time</FormLabel>
              <FormHelperText sx={{ml: 0}}>
                Choose the time period to show the total time for in the menu
                bar
              </FormHelperText>
              <RadioGroup
                value={applicationSettings.summaryTime}
                onChange={(e) =>
                  updateApplicationSettings({
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

      <Typography variant="h2" sx={{mb: 2, mt: 4}}>
        Theme
      </Typography>

      <Card>
        <CardContent>
          <FormSection disableTopPadding>
            <Button
              variant="outlined"
              onClick={() =>
                updateApplicationSettings({
                  mode: applicationSettings.mode === "dark" ? "light" : "dark"
                })
              }
              startIcon={
                applicationSettings.mode === "light" ? (
                  <LightMode />
                ) : (
                  <DarkMode />
                )
              }
              sx={{alignSelf: "flex-start"}}
            >
              {applicationSettings.mode} Mode
            </Button>

            <ColorPicker />
          </FormSection>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Settings
