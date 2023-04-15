import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material"
import {Project, Task} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useState} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {formatDollars, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {
  filtersToProjectCondition,
  filtersToTimeEntryCondition
} from "./ReportFilters"
import {ReportProps} from "./ReportsPage"
import {Widgets} from "./Widgets"

export type SummarizeByProject = Record<
  string,
  {projectTasks: Task[]; projectHours: number}
>

export const RevenueReport: FC<ReportProps> = ({reportFilterValues}) => {
  const {session, currentUser} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[]>()
  const [tasks, setTasks] = useState<Task[]>()
  const [msPerTask, setMsPerTask] =
    useState<Record<string, number | null | undefined>>()
  const [orphanMsPerTask, setOrphanMsPerTask] =
    useState<Record<string, number | null | undefined>>()

  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!expanded) return

    // Scroll to the top of the section
    const element = document.getElementById(expanded)
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({behavior: "smooth", block: "start"})
      }, 300)
    }
  }, [expanded])

  useEffect(() => {
    setTasks(undefined)
    setMsPerTask(undefined)
    setOrphanMsPerTask(undefined)

    const timeEntryCondition = filtersToTimeEntryCondition(reportFilterValues)

    const millisecondsPerTaskRequest = session.timeEntry.groupAggregate({
      aggregate: Aggregate.Sum,
      condition: {
        And: [
          timeEntryCondition,
          {task: {NotEqual: null}},
          {organization: {Equal: currentUser.organization}}
        ]
      },
      groupBy: "task",
      property: "durationMilliseconds"
    })

    const orphanMillisecondsPerProjectRequest =
      session.timeEntry.groupAggregate({
        aggregate: Aggregate.Sum,
        condition: {
          And: [
            timeEntryCondition,
            {task: {Equal: null}},
            {organization: {Equal: currentUser.organization}}
          ]
        },
        groupBy: "project",
        property: "durationMilliseconds"
      })

    const projectsRequest = session.project.query({
      condition: filtersToProjectCondition(reportFilterValues),
      limit: QUERY_LIMIT
    })

    Promise.all([
      millisecondsPerTaskRequest,
      orphanMillisecondsPerProjectRequest,
      projectsRequest
    ])
      .then(
        ([
          millisecondsPerTask,
          orphanMillisecondsPerProject,
          projectsResponse
        ]) => {
          setMsPerTask(millisecondsPerTask)
          setOrphanMsPerTask(orphanMillisecondsPerProject)
          setProjects(projectsResponse)
          projectsResponse.length === 1 && setExpanded(projectsResponse[0]._id)
        }
      )
      .catch(() => setError("Error fetching data"))
  }, [reportFilterValues])

  useEffect(() => {
    if (!msPerTask) return

    const uniqueTaskIds = new Set(Object.keys(msPerTask))

    session.task
      .query({
        condition: {_id: {Inside: Array.from(uniqueTaskIds)}},
        limit: QUERY_LIMIT
      })
      .then(setTasks)
      .catch(() => setError("Error fetching tasks"))
  }, [msPerTask])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  if (!projects || !tasks || !msPerTask || !orphanMsPerTask) {
    return <Loading />
  }

  return (
    <Box>
      <Widgets reportFilterValues={reportFilterValues} />

      {projects
        .map((project) => {
          const projectTasks = tasks.filter(
            (task) => task.project === project._id
          )
          const taskMilliseconds = projectTasks.reduce((acc, task) => {
            return acc + (msPerTask[task._id] ?? 0)
          }, 0)
          const orphanMilliseconds = orphanMsPerTask[project._id] ?? 0

          return {
            project,
            projectTasks,
            orphanHours: orphanMilliseconds / MILLISECONDS_PER_HOUR,
            totalHours:
              (taskMilliseconds + orphanMilliseconds) / MILLISECONDS_PER_HOUR
          }
        })
        .sort(
          (a, b) =>
            b.totalHours - a.totalHours ||
            a.project.name.localeCompare(b.project.name)
        )
        .map(({project, projectTasks, orphanHours, totalHours}) => {
          return (
            <Accordion
              key={project._id}
              id={project._id}
              expanded={project._id === expanded}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                onClick={() =>
                  setExpanded(expanded === project._id ? null : project._id)
                }
              >
                <Typography variant="h2">
                  {project.name ?? "Not found"}
                </Typography>
                <Stack sx={{ml: "auto", mr: 1}} alignItems="flex-end">
                  <Typography fontSize="1.2rem">
                    {formatDollars((project.rate ?? 0) * totalHours, false)}
                  </Typography>
                  <HoverHelp description={totalHours.toFixed(2)}>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(totalHours)} hr.
                    </Typography>
                  </HoverHelp>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{p: 0}}>
                <List>
                  {projectTasks
                    .sort(
                      (a, b) =>
                        (msPerTask[b._id] ?? 0) - (msPerTask[a._id] ?? 0)
                    )
                    .map((task) => {
                      const totalHours =
                        (msPerTask[task._id] ?? 0) / MILLISECONDS_PER_HOUR

                      return (
                        <ListItem key={task._id}>
                          <ListItemText
                            primary={task.summary}
                            secondary={`${task.state} – ${totalHours.toFixed(
                              1
                            )} hours`}
                          />
                        </ListItem>
                      )
                    })}
                  {orphanHours > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Project Management"
                        secondary={`${orphanHours.toFixed(1)} hours`}
                      />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}
    </Box>
  )
}
