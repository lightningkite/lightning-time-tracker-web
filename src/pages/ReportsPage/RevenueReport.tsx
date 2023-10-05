import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material"
import type {Project, Task} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {MILLISECONDS_PER_HOUR, formatDollars} from "utils/helpers"
import {
  filtersToProjectCondition,
  filtersToTimeEntryCondition
} from "./ReportFilters"
import type {ReportProps} from "./ReportsPage"
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
  const [msPerProject, setMsPerProject] =
    useState<Record<string, number | null | undefined>>()
  const [orphanMsPerProject, setOrphanMsPerProject] =
    useState<Record<string, number | null | undefined>>()

  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

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
    setOrphanMsPerProject(undefined)

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

    const millisecondsPerProjectRequest = session.timeEntry.groupAggregate({
      aggregate: Aggregate.Sum,
      condition: {
        And: [
          timeEntryCondition,
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
      projectsRequest,
      millisecondsPerProjectRequest
    ])
      .then(
        ([
          millisecondsPerTask,
          orphanMillisecondsPerProject,
          projectsResponse,
          millisecondsPerProject
        ]) => {
          setMsPerTask(millisecondsPerTask)
          setOrphanMsPerProject(orphanMillisecondsPerProject)
          setProjects(projectsResponse)
          setMsPerProject(millisecondsPerProject)

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

  if (
    !projects ||
    !tasks ||
    !msPerTask ||
    !orphanMsPerProject ||
    !msPerProject
  ) {
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
          const orphanMilliseconds = orphanMsPerProject[project._id] ?? 0
          const totalMilliseconds = msPerProject[project._id] ?? 0

          return {
            project,
            projectTasks,
            orphanHours: orphanMilliseconds / MILLISECONDS_PER_HOUR,
            totalHours: totalMilliseconds / MILLISECONDS_PER_HOUR
          }
        })
        .filter(({projectTasks}) => showAll || projectTasks.length > 0)
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

                  <Typography variant="body2" color="text.secondary">
                    ${project.rate ?? 0} &times; {totalHours.toFixed(2)} hr
                  </Typography>
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
                              2
                            )} hours`}
                          />
                        </ListItem>
                      )
                    })}
                  {orphanHours > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Project Management"
                        secondary={`${orphanHours.toFixed(2)} hours`}
                      />
                    </ListItem>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}

      {!showAll && (
        <Button
          variant="outlined"
          sx={{mt: 3, display: "block", mx: "auto"}}
          onClick={() => setShowAll(true)}
        >
          Show All
        </Button>
      )}
    </Box>
  )
}
