import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  List,
  Typography
} from "@mui/material"
import {Project, Task, TaskState, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {compareTasks} from "utils/helpers"
import {TaskListItem} from "./TaskListItem"

const dashboardTaskStates: TaskState[] = [
  TaskState.Active,
  TaskState.Completed,
  TaskState.Tested
]

export const ProjectsTasks: FC = () => {
  const {session, currentOrganization, currentUser} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[] | null>()
  const [tasks, setTasks] = useState<Task[] | null>()
  const [users, setUsers] = useState<User[] | null>()
  const [initialSorting, setInitialSorting] = useState<string[]>()

  useEffect(() => {
    session.user
      .query({condition: {organization: {Equal: currentOrganization._id}}})
      .then(setUsers)
      .catch(() => setUsers(null))

    session.project
      .query({condition: {organization: {Equal: currentOrganization._id}}})
      .then(setProjects)
      .catch(() => setProjects(null))

    session.task
      .query({
        condition: {
          And: [
            {organization: {Equal: currentOrganization._id}},
            {state: {Inside: dashboardTaskStates}}
          ]
        }
      })
      .then(setTasks)
      .catch(() => setTasks(null))
  }, [])

  const tasksByProject = useMemo(() => {
    if (!tasks || !projects) return {}

    const tasksByProject: Record<
      string,
      {projectTasks: Task[]; myTasksCount: number}
    > = {}

    projects.forEach((project) => {
      const projectTasks = tasks
        .filter((task) => task.project === project._id)
        .sort((a, b) => a.description.localeCompare(b.description))

      const myTasksCount = projectTasks.filter(
        (task) => task.user === currentUser._id
      ).length

      tasksByProject[project.name] = {projectTasks, myTasksCount}
    })

    return tasksByProject
  }, [tasks, projects])

  useEffect(() => {
    if (!tasksByProject || initialSorting) return

    setInitialSorting(
      Object.entries(tasksByProject)
        .sort((a, b) => b[1].myTasksCount - a[1].myTasksCount)
        .map(([projectName]) => projectName)
    )
  }, [tasksByProject])

  if (
    projects === undefined ||
    tasks === undefined ||
    users === undefined ||
    !initialSorting
  ) {
    return <Loading />
  }

  if (projects === null || tasks === null || users === null) {
    return <ErrorAlert>Error loading tasks</ErrorAlert>
  }

  return (
    <Box>
      {Object.entries(tasksByProject)
        .sort(
          (a, b) => initialSorting.indexOf(a[0]) - initialSorting.indexOf(b[0])
        )
        .map(([projectName, {projectTasks, myTasksCount}]) => (
          <Accordion key={projectName} defaultExpanded={myTasksCount > 0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Chip
                label={myTasksCount}
                size="small"
                color="primary"
                sx={{mr: 2, visibility: myTasksCount ? "visible" : "hidden"}}
              />
              <Typography variant="h2">{projectName}</Typography>{" "}
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {projectTasks.sort(compareTasks).map((task) => (
                  <TaskListItem
                    task={task}
                    setTask={(updatedTask) =>
                      setTasks(
                        tasks.map((t) =>
                          t._id === updatedTask._id ? updatedTask : t
                        )
                      )
                    }
                    users={users}
                    key={task._id}
                  />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  )
}
