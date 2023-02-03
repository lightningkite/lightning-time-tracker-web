import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC} from "react"

const Dashboard: FC = () => {
  return (
    <Container maxWidth="md">
      <PageHeader title="Home Page" />
    </Container>
  )
}

export default Dashboard
