import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import type {FC} from "react";
import React from "react"
import {ProjectsTasks} from "./ProjectsTasks"

const Dashboard: FC = () => {
  return (
    <Container maxWidth="md">
      <PageHeader title="Dashboard"></PageHeader>
      <ProjectsTasks />
    </Container>
  )
}

export default Dashboard
