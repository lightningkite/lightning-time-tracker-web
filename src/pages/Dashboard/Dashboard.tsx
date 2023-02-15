import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Container, FormControlLabel, Switch} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useState} from "react"
import {ProjectsTasks} from "./ProjectsTasks"

const Dashboard: FC = () => {
  const [onlyMine, setOnlyMine] = useState(false)

  return (
    <Container maxWidth="md">
      <PageHeader title="Dashboard">
        <HoverHelp description="Only show tasks assigned to myself">
          <FormControlLabel
            labelPlacement="start"
            control={
              <Switch
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
              />
            }
            label="Only mine"
          />
        </HoverHelp>
      </PageHeader>
      <ProjectsTasks onlyMine={onlyMine} />
    </Container>
  )
}

export default Dashboard
