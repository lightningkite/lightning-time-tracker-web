import {Card, CardContent, Container, Typography} from "@mui/material"
import {Project} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {DeleteProjectButton} from "./DeleteProjectButton"
import {ProjectForm} from "./ProjectForm"

const ProjectDetail: FC = () => {
  const {projectId} = useParams()
  const {session} = useContext(AuthContext)

  const [project, setProject] = useState<Project | null>()

  useEffect(() => {
    session.project
      .detail(projectId as string)
      .then(setProject)
      .catch(() => setProject(null))
  }, [projectId])

  if (project === undefined) {
    return <Loading />
  }

  if (project === null) {
    return <ErrorAlert>Error loading project</ErrorAlert>
  }

  return (
    <Container maxWidth="md">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          ["All Projects", "/projects"],
          [project.name, ""]
        ]}
      >
        <DeleteProjectButton project={project} />
      </PageHeader>

      <Card>
        <CardContent sx={{mt: 2}}>
          <ProjectForm project={project} setProject={setProject} />
        </CardContent>
      </Card>

      <Typography variant="h2" sx={{mt: 4, mb: 2}}>
        Time Entries
      </Typography>

      <TimeEntryTable
        additionalQueryConditions={[{project: {Equal: project._id}}]}
        hiddenColumns={["project", "summary"]}
      />
    </Container>
  )
}

export default ProjectDetail
