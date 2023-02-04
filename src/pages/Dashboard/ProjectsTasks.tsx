import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  Typography
} from "@mui/material"
import {Project, Task, TaskState} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {TaskListItem} from "./TaskListItem"

export const ProjectsTasks: FC = () => {
  const {session} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[] | null>()
  const [tasks, setTasks] = useState<Task[] | null>()

  useEffect(() => {
    session.project
      .query({})
      .then(setProjects)
      .catch(() => setProjects(null))
  }, [])

  useEffect(() => {
    session.task
      .query({condition: {state: {Inside: [TaskState.Active]}}})
      .then(setTasks)
      .catch(() => setTasks(null))
  }, [])

  const tasksByProject: Record<string, Task[]> = useMemo(() => {
    if (!tasks || !projects) return {}

    const tasksByProject: Record<string, Task[]> = {}

    projects.forEach((project) => {
      const projectTasks = tasks
        .filter((task) => task.project === project._id)
        .sort((a, b) => a.description.localeCompare(b.description))

      tasksByProject[project.name] = projectTasks
    })

    return tasksByProject
  }, [tasks, projects])

  if (projects === undefined || tasks === undefined) {
    return <Loading />
  }

  if (projects === null || tasks === null) {
    return <ErrorAlert>Error loading tasks</ErrorAlert>
  }

  return (
    <Box>
      {Object.entries(tasksByProject).map(([projectName, projectTasks]) => (
        <Accordion key={projectName}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h2">{projectName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {projectTasks.map((task) => (
                <TaskListItem task={task} key={task._id} />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
