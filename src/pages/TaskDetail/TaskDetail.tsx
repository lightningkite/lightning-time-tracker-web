import {Card, CardContent, Container, Typography} from "@mui/material"
import {Task} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import React, {FC, useContext, useEffect, useState} from "react"
import {useLocation, useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {DeleteTaskButton} from "./DeleteTaskButton"
import {TaskForm} from "./TaskForm"

const TaskDetail: FC = () => {
  const {taskId} = useParams()
  const {session} = useContext(AuthContext)
  const location = useLocation()

  const [task, setTask] = useState<Task | null>()

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

  const isFromDashboard = location.pathname.includes("/dashboard")
  const shortDescription =
    task.description.length > 20
      ? task.description.slice(0, 30) + "..."
      : task.description

  return (
    <Container maxWidth="md">
      <PageHeader
        title={shortDescription}
        breadcrumbs={
          isFromDashboard
            ? [
                ["Dashboard", "/dashboard"],
                [shortDescription, ""]
              ]
            : [
                ["All Tasks", "/tasks"],
                [shortDescription, ""]
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
