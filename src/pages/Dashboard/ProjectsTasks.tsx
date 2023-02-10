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
import {Project, TaskState} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {compareTasks} from "utils/helpers"
import {AnnotatedTask, useAnnotatedEndpoints} from "utils/useAnnotatedEndpoints"
import {TaskListItem} from "./TaskListItem"

const dashboardTaskStates: TaskState[] = [
  TaskState.Active,
  TaskState.Completed,
  TaskState.Tested
]

export const ProjectsTasks: FC = () => {
  const {session, currentOrganization, currentUser} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const {annotatedTaskEndpoint} = useAnnotatedEndpoints()

  const [projects, setProjects] = useState<Project[] | null>()
  const [annotatedTasks, setAnnotatedTasks] = useState<AnnotatedTask[] | null>()
  const [initialSorting, setInitialSorting] = useState<string[]>()

  useEffect(() => {
    session.project
      .query({condition: {organization: {Equal: currentOrganization._id}}})
      .then(setProjects)
      .catch(() => setProjects(null))

    annotatedTaskEndpoint
      .query({
        condition: {
          And: [
            {organization: {Equal: currentOrganization._id}},
            {state: {Inside: dashboardTaskStates}}
          ]
        }
      })
      .then(setAnnotatedTasks)
      .catch(() => setAnnotatedTasks(null))
  }, [Object.values(timers).length])

  const tasksByProject = useMemo(() => {
    if (!annotatedTasks || !projects) return {}

    const tasksByProject: Record<
      string,
      {projectTasks: AnnotatedTask[]; myTasksCount: number}
    > = {}

    projects.forEach((project) => {
      const projectTasks = annotatedTasks
        .filter((task) => task.project === project._id)
        .sort((a, b) => a.summary.localeCompare(b.summary))

      const myTasksCount = projectTasks.filter(
        (task) => task.user === currentUser._id
      ).length

      tasksByProject[project.name] = {projectTasks, myTasksCount}
    })

    return tasksByProject
  }, [annotatedTasks, projects])

  useEffect(() => {
    if (!annotatedTasks || !projects || initialSorting) return

    setInitialSorting(
      Object.entries(tasksByProject)
        .sort((a, b) => a[1].myTasksCount - b[1].myTasksCount)
        .map(([projectName]) => projectName)
    )
  }, [tasksByProject])

  if (
    projects === undefined ||
    annotatedTasks === undefined ||
    !initialSorting
  ) {
    return <Loading />
  }

  if (projects === null || annotatedTasks === null) {
    return <ErrorAlert>Error loading tasks</ErrorAlert>
  }

  return (
    <Box>
      {Object.entries(tasksByProject)
        .sort(
          (a, b) => initialSorting.indexOf(b[0]) - initialSorting.indexOf(a[0])
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
              <Typography variant="h2">{projectName}</Typography>
              <AddTaskButton
                projectId={
                  projects.find((p) => p.name === projectName)?._id ?? ""
                }
                afterSubmit={() => console.log("hello")}
                sx={{ml:'auto', mr: 2}}
              />
            </AccordionSummary>
            <AccordionDetails sx={{p: 0}}>
              <List>
                {projectTasks.sort(compareTasks).map((task) => (
                  <TaskListItem annotatedTask={task} key={task._id} />
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  )
}
