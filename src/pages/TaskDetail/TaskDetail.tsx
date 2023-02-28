import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Card, CardContent, Container, Paper, Tab} from "@mui/material"
import {Task} from "api/sdk"
import {CommentSection} from "components/CommentSection"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {DeleteTaskButton} from "./DeleteTaskButton"
import {TaskForm} from "./TaskForm"
import {TimeEntryTab} from "./TimeEntryTab"

const MAX_TITLE_LENGTH = 40

const TaskDetail: FC = () => {
  const {taskId, projectId} = useParams()
  const {session} = useContext(AuthContext)

  const [task, setTask] = useState<Task | null>()
  const [tab, setTab] = useState("1")

  useEffect(() => {
    session.task
      .detail(taskId as string)
      .then(setTask)
      .catch(() => setTask(null))
  }, [taskId])

  if (task === undefined) {
    return <Loading />
  }

  if (task === null) {
    return <ErrorAlert>Error loading task</ErrorAlert>
  }

  const shortSummary =
    task.summary.length > MAX_TITLE_LENGTH
      ? task.summary.slice(0, MAX_TITLE_LENGTH) + "..."
      : task.summary

  return (
    <Container maxWidth="md">
      <PageHeader
        title={shortSummary}
        breadcrumbs={
          projectId !== undefined
            ? [
                ["All Projects", "/projects"],
                [
                  task.projectName ?? "Unknown Project",
                  `/projects/${projectId}`
                ],
                [shortSummary, ""]
              ]
            : [
                ["Dashboard", "/dashboard"],
                [shortSummary, ""]
              ]
        }
      >
        <DeleteTaskButton task={task} />
      </PageHeader>

      <Card>
        <CardContent sx={{mt: 2}}>
          <TaskForm task={task} setTask={setTask} />
        </CardContent>
      </Card>

      <TabContext value={tab}>
        <Paper sx={{mt: 4, mb: 1}}>
          <TabList onChange={(_e, v) => setTab(v as string)}>
            <Tab label="Comments" value="1" />
            <Tab label="Time Entries" value="2" />
          </TabList>
        </Paper>

        <TabPanel value="1" sx={{p: 0, pt: 2}}>
          <CommentSection task={task} />
        </TabPanel>
        <TabPanel value="2" sx={{p: 0}}>
          <TimeEntryTab task={task} />
        </TabPanel>
      </TabContext>
    </Container>
  )
}

export default TaskDetail
