import {DarkMode, LightMode} from "@mui/icons-material"
import {Button, Card, CardContent, Container, Typography} from "@mui/material"
import FormSection from "components/FormSection"
import PageHeader from "components/PageHeader"
import {UserForm} from "components/UserForm"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"
import {ColorPicker} from "./ColorPicker"

const Settings: FC = () => {
  const {logout, mode, setMode, currentUser, setCurrentUser} =
    useContext(AuthContext)

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
            <Button
              variant="outlined"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              startIcon={mode === "dark" ? <DarkMode /> : <LightMode />}
              sx={{alignSelf: "flex-start"}}
            >
              {mode} Mode
            </Button>

            <ColorPicker />
          </FormSection>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Settings
