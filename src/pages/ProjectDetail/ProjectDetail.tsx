import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Card, CardContent, Container, Paper, Tab} from "@mui/material"
import {Project} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {ProjectForm} from "./ProjectForm"
import {TaskTab} from "./TaskTab"
import {TimeEntryTab} from "./TimeEntryTab"

const ProjectDetail: FC = () => {
  const {projectId} = useParams()
  const {session} = useContext(AuthContext)

  const [project, setProject] = useState<Project | null>()
  const [tab, setTab] = useState("1")

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
        {/* {permissions.manageProjects && (
          <DeleteProjectButton project={project} />
        )} */}
      </PageHeader>

      <Card>
        <CardContent sx={{mt: 2}}>
          <ProjectForm project={project} setProject={setProject} />
        </CardContent>
      </Card>

      <TabContext value={tab}>
        <Paper sx={{mt: 4, mb: 1}}>
          <TabList onChange={(_e, v) => setTab(v as string)}>
            <Tab label="Tasks" value="1" />
            <Tab label="Time Entries" value="2" />
          </TabList>
        </Paper>

        <TabPanel value="1" sx={{p: 0}}>
          <TaskTab project={project} />
        </TabPanel>
        <TabPanel value="2" sx={{p: 0}}>
          <TimeEntryTab project={project} />
        </TabPanel>
      </TabContext>
    </Container>
  )
}

export default ProjectDetail
