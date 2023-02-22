import {Aggregate, Condition} from "@lightningkite/lightning-server-simplified"
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
import {Project, Task, TimeEntry} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, formatDollars, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {DateRange} from "./ReportFilters"
import {Widgets} from "./Widgets"

export type SummarizeByProject = Record<
  string,
  {projectTasks: Task[]; projectHours: number}
>

export const RevenueReport: FC<{dateRange: DateRange}> = ({dateRange}) => {
  const {session} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[]>()
  const [tasks, setTasks] = useState<Task[]>()
  const [msPerTask, setMsPerTask] =
    useState<Record<string, number | null | undefined>>()
  const [orphanMsPerTask, setOrphanMsPerTask] =
    useState<Record<string, number | null | undefined>>()

  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    session.project
      .query({})
      .then(setProjects)
      .catch(() => setError("Error fetching projects"))
  }, [])

  useEffect(() => {
    setTasks(undefined)
    setMsPerTask(undefined)
    setOrphanMsPerTask(undefined)

    const timeEntryDateRangeConditions: Condition<TimeEntry>[] = [
      {date: {GreaterThanOrEqual: dateToISO(dateRange.start.toDate())}},
      {date: {LessThanOrEqual: dateToISO(dateRange.end.toDate())}}
    ]

    const millisecondsPerTaskRequest = session.timeEntry.groupAggregate({
      aggregate: Aggregate.Sum,
      condition: {
        And: [...timeEntryDateRangeConditions, {task: {NotEqual: null}}]
      },
      groupBy: "task",
      property: "durationMilliseconds"
    })

    const orphanMillisecondsPerProjectRequest =
      session.timeEntry.groupAggregate({
        aggregate: Aggregate.Sum,
        condition: {
          And: [...timeEntryDateRangeConditions, {task: {Equal: null}}]
        },
        groupBy: "project",
        property: "durationMilliseconds"
      })

    Promise.all([
      millisecondsPerTaskRequest,
      orphanMillisecondsPerProjectRequest
    ])
      .then(([millisecondsPerTask, orphanMillisecondsPerProject]) => {
        setMsPerTask(millisecondsPerTask)
        setOrphanMsPerTask(orphanMillisecondsPerProject)
      })
      .catch(() => setError("Error fetching time entries"))
  }, [dateRange])

  useEffect(() => {
    if (!msPerTask) return

    const uniqueTaskIds = new Set(Object.keys(msPerTask))

    session.task
      .query({
        condition: {_id: {Inside: Array.from(uniqueTaskIds)}}
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
      <Widgets dateRange={dateRange} />

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
            <Accordion key={project._id} expanded={project._id === expanded}>
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
                        primary="Other time"
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
