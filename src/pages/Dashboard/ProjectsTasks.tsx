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
import type {Project} from "api/sdk"
import {TaskState} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {useAnnotatedEndpoints} from "hooks/useAnnotatedEndpoints"
import usePeriodicRefresh from "hooks/usePeriodicRefresh"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useEffect, useMemo, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {
  booleanCompare,
  compareTasksByPriority,
  compareTasksByState
} from "utils/helpers"
import {TaskListItem} from "./TaskListItem"
import {TaskModal} from "components/TaskModal"
import {useNavigate, useSearchParams} from "react-router-dom"

export const ProjectsTasks: FC = () => {
  const {session, currentOrganization, currentUser} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const {annotatedTaskEndpoint} = useAnnotatedEndpoints()
  const permissions = usePermissions()
  const [urlParams, setUrlParams] = useSearchParams()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[] | null>()
  const [annotatedTasks, setAnnotatedTasks] = useState<AnnotatedTask[] | null>()
  const [initialSorting, setInitialSorting] = useState<string[]>()

  const [focusTask, setFocusTask] = useState<AnnotatedTask | null>(null)

  const refreshTrigger = usePeriodicRefresh(10 * 60)

  const refreshDashboardData = async () => {
    session.project
      .query({condition: {organization: {Equal: currentOrganization._id}}})
      .then(setProjects)
      .catch(() => setProjects(null))

    await annotatedTaskEndpoint
      .query({
        condition: {
          And: [
            {organization: {Equal: currentOrganization._id}},
            {user: {Equal: currentUser._id}},
            {
              state: {
                Or: [{Equal: TaskState.Active}, {Equal: TaskState.PullRequest}]
              }
            }
          ]
        }
      })
      .then(setAnnotatedTasks)
      .catch(() => setAnnotatedTasks(null))
  }

  useEffect(() => {
    refreshDashboardData()
  }, [refreshTrigger, timers?.length])

  const tasksByProject = useMemo(() => {
    if (!annotatedTasks || !projects) return {}

    const tasksByProject: Record<
      string,
      {projectTasks: AnnotatedTask[]; myTasksCount: number}
    > = {}

    projects.forEach((project) => {
      const projectTasks = annotatedTasks.filter(
        (task) => task.project === project._id
      )

      const myTasksCount = projectTasks.length

      tasksByProject[project._id] = {projectTasks, myTasksCount}
    })

    const allTasks = Object.values(tasksByProject).flatMap(
      (project) => project.projectTasks
    )
    const taskFromParams = urlParams.get("task")
    if (taskFromParams) {
      const focussed = allTasks.find((task) => task._id === taskFromParams)
      if (focussed) {
        setFocusTask(focussed)
      } else {
        // For when the url is displaying a certain task but you don't have that task in your list.
        session.task
          .detail(taskFromParams)
          .then((task) =>
            navigate(`/project-boards?project=${task.project}&task=${task._id}`)
          )
      }
    }

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

  if (annotatedTasks.length === 0) {
    return (
      <Typography my={5} fontStyle="italic" textAlign="center">
        You have no active tasks!
      </Typography>
    )
  }

  return (
    <Box>
      {Object.entries(tasksByProject)
        .filter(([_, {projectTasks}]) => projectTasks.length > 0)
        .sort(
          (a, b) => initialSorting.indexOf(b[0]) - initialSorting.indexOf(a[0])
        )
        .map(([projectId, {projectTasks, myTasksCount}]) => {
          const project = projects.find((p) => p._id === projectId)

          return (
            <Accordion key={projectId} defaultExpanded={myTasksCount > 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Chip
                  label={myTasksCount}
                  size="small"
                  color="primary"
                  sx={{mr: 2, visibility: myTasksCount ? "visible" : "hidden"}}
                />
                <Typography variant="h2">{project?.name}</Typography>
                {permissions.canManageAllTasks && (
                  <AddTaskButton
                    projects={[project!]}
                    afterSubmit={(newAnnotatedTask) =>
                      setAnnotatedTasks([
                        ...(annotatedTasks ?? []),
                        newAnnotatedTask
                      ])
                    }
                    sx={{ml: "auto", mr: 2}}
                  />
                )}
              </AccordionSummary>
              <AccordionDetails sx={{p: 0}}>
                <List>
                  {projectTasks
                    // Sort by emergency, state, then by is current user
                    .sort((a, b) => {
                      return (
                        booleanCompare(a, b, (t) => t.emergency) ||
                        compareTasksByState(a, b) ||
                        booleanCompare(
                          a,
                          b,
                          (t) => t.user === currentUser._id
                        ) ||
                        compareTasksByPriority(a, b)
                      )
                    })
                    .map((task) => (
                      <TaskListItem
                        annotatedTask={task}
                        refreshDashboard={refreshDashboardData}
                        openTaskInModal={() => {
                          urlParams.set("task", task._id)
                          setUrlParams(urlParams)
                          setFocusTask(task)
                        }}
                        key={task._id}
                      />
                    ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}

      <TaskModal
        task={focusTask}
        handleClose={() => {
          urlParams.delete("task")
          setUrlParams(urlParams)
          setFocusTask(null)
        }}
        setTask={(task) => {
          setAnnotatedTasks(
            (prev) =>
              prev?.map((t) => (t._id === task._id ? {...t, ...task} : t))
          )
        }}
      />
    </Box>
  )
}
