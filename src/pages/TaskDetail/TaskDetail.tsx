import {Card, CardContent, Container, Typography} from "@mui/material"
import {Project, Task} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {DeleteTaskButton} from "./DeleteTaskButton"
import {TaskForm} from "./TaskForm"

const TaskDetail: FC = () => {
  const {taskId, projectId} = useParams()
  const {session} = useContext(AuthContext)

  const [task, setTask] = useState<Task | null>()
  const [project, setProject] = useState<Project | null>()

  useEffect(() => {
    session.task
      .detail(taskId as string)
      .then(setTask)
      .catch(() => setTask(null))

    projectId &&
      session.project
        .detail(projectId)
        .then(setProject)
        .catch(() => setProject(null))
  }, [taskId])

  if (task === undefined || (projectId && project === undefined)) {
    return <Loading />
  }

  if (task === null || project === null) {
    return <ErrorAlert>Error loading task</ErrorAlert>
  }

  const shortSummary =
    task.summary.length > 20 ? task.summary.slice(0, 30) + "..." : task.summary

  return (
    <Container maxWidth="md">
      <PageHeader
        title={shortSummary}
        breadcrumbs={
          project
            ? [
                ["All Projects", "/projects"],
                [project.name, `/projects/${project._id}`],
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

      <Typography variant="h2" sx={{mt: 4, mb: 2}}>
        Time Entries
      </Typography>

      <TimeEntryTable
        additionalQueryConditions={[{task: {Equal: task._id}}]}
        hiddenColumns={["project", "summary", "task"]}
      />
    </Container>
  )
}

export default TaskDetail
