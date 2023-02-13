import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@mui/material"
import {Project, Task, TimeEntry} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, formatDollars, totalHoursForTimeEntries} from "utils/helpers"
import {DateRange} from "./DateRangeSelector"
import {Widgets} from "./Widgets"

export type SummarizeByProject = Record<
  string,
  {projectTasks: Task[]; projectHours: number}
>

export const ProjectReport: FC<{dateRange: DateRange}> = ({dateRange}) => {
  const {session} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[]>()
  const [tasks, setTasks] = useState<Task[]>()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>()

  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    session.project
      .query({})
      .then(setProjects)
      .catch(() => setError("Error fetching projects"))
  }, [])

  useEffect(() => {
    setTimeEntries(undefined)
    setTasks(undefined)

    session.timeEntry
      .query({
        condition: {
          And: [
            {date: {GreaterThanOrEqual: dateToISO(dateRange.start.toDate())}},
            {date: {LessThanOrEqual: dateToISO(dateRange.end.toDate())}}
          ]
        }
      })
      .then(setTimeEntries)
      .catch(() => setError("Error fetching time entries"))
  }, [dateRange])

  useEffect(() => {
    if (!timeEntries) return

    const uniqueTaskIds = new Set(
      timeEntries.reduce<string[]>((acc, timeEntry) => {
        timeEntry.task && acc.push(timeEntry.task)
        return acc
      }, [])
    )

    session.task
      .query({
        condition: {_id: {Inside: Array.from(uniqueTaskIds)}}
      })
      .then(setTasks)
      .catch(() => setError("Error fetching tasks"))
  }, [timeEntries])

  const hoursPerTask = useMemo(() => {
    if (!timeEntries || !tasks) return {}

    const perTask: Record<string, number> = {}

    tasks.forEach((task) => {
      const taskTimeEntries = timeEntries.filter(
        (timeEntry) => timeEntry.task === task._id
      )
      const totalHours = totalHoursForTimeEntries(taskTimeEntries)
      perTask[task._id] = totalHours
    })

    return perTask
  }, [timeEntries, tasks])

  const summarizeByProject: SummarizeByProject = useMemo(() => {
    if (!tasks || !projects || !timeEntries) return {}

    const byProject: SummarizeByProject = {}

    projects.forEach((project) => {
      const projectTasks = tasks.filter((task) => task.project === project._id)
      const projectHours = totalHoursForTimeEntries(
        timeEntries.filter((t) => t.project === project._id)
      )

      byProject[project._id] = {projectTasks, projectHours}
    })

    return byProject
  }, [tasks])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }
  if (!projects || !tasks || !timeEntries) {
    return <Loading />
  }

  return (
    <Box>
      <Widgets
        summarizeByProject={summarizeByProject}
        projects={projects}
        dateRange={dateRange}
      />

      {Object.entries(summarizeByProject)
        .sort(
          (a, b) =>
            b[1].projectHours - a[1].projectHours || a[0].localeCompare(b[0])
        )
        .map(([projectId, {projectTasks, projectHours}]) => {
          const project = projects.find((p) => p._id === projectId)
          const orphanedTimeEntries = timeEntries.filter(
            (t) => t.project === projectId && !t.task
          )

          return (
            <Accordion key={projectId} expanded={projectId === expanded}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                onClick={() =>
                  setExpanded(expanded === projectId ? null : projectId)
                }
              >
                <Typography variant="h2">
                  {project?.name ?? "Not found"}
                </Typography>
                <Typography fontSize="1.2rem" sx={{ml: "auto", mr: 1}}>
                  {formatDollars((project?.rate ?? 0) * projectHours, false)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{p: 0}}>
                <List>
                  {projectTasks
                    .sort((a, b) => hoursPerTask[b._id] - hoursPerTask[a._id])
                    .map((task) => {
                      const totalHours = hoursPerTask[task._id]

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

                  {orphanedTimeEntries.length > 0 && (
                    <ListItem>
                      <ListItemText
                        primary="Other time"
                        secondary={`${totalHoursForTimeEntries(
                          orphanedTimeEntries
                        ).toFixed(1)} hours`}
                      />
                    </ListItem>
                  )}

                  <Alert severity="info" sx={{mx: 2, mt: 1}}>
                    <Typography fontWeight="bold">
                      Total hours: {projectHours.toFixed(2)}
                    </Typography>
                  </Alert>
                </List>
              </AccordionDetails>
            </Accordion>
          )
        })}
    </Box>
  )
}
