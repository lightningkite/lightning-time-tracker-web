import {DarkMode, LightMode} from "@mui/icons-material"
import {Button, Card, CardContent, Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

const Settings: FC = () => {
  const {logout, mode, setMode} = useContext(AuthContext)

  return (
    <Container maxWidth="md">
      <PageHeader title="Settings">
        <Button variant="contained" onClick={logout}>
          Logout
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <Button
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            startIcon={mode === "dark" ? <DarkMode /> : <LightMode />}
          >
            {mode} Mode
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Settings
