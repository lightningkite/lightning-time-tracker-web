import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography
} from "@mui/material"
import {Project, Task, TimeEntry, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, formatDollars} from "utils/helpers"
import {Widgets} from "./Widgets"

interface SelectedMonth {
  monthIndex: number
  year: number
}

export type TasksByProject = Record<
  string,
  {projectTasks: Task[]; totalHours: number}
>

const Reports: FC = () => {
  const {session} = useContext(AuthContext)

  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(
    getCurrentSelectedMonth()
  )
  const [projects, setProjects] = useState<Project[]>()
  const [tasks, setTasks] = useState<Task[]>()
  const [users, setUsers] = useState<User[]>()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>()

  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([session.project.query({}), session.user.query({})])
      .then(([projects, users]) => {
        setProjects(projects)
        setUsers(users)
      })
      .catch(() => setError("Error fetching users or projects"))
  }, [])

  useEffect(() => {
    const dateRange = getSelectedMonthDateRange(selectedMonth)

    session.timeEntry
      .query({
        condition: {
          And: [
            {date: {GreaterThanOrEqual: dateToISO(dateRange[0])}},
            {date: {LessThanOrEqual: dateToISO(dateRange[1])}}
          ]
        }
      })
      .then(setTimeEntries)
      .catch(() => setError("Error fetching time entries"))
  }, [selectedMonth])

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

  const timeEntriesByTask = useMemo(() => {
    if (!timeEntries || !tasks) return {}

    const timeEntriesByTask: Record<
      string,
      {taskTimeEntries: TimeEntry[]; totalHours: number}
    > = {}

    tasks.forEach((task) => {
      const taskTimeEntries = timeEntries.filter(
        (timeEntry) => timeEntry.task === task._id
      )

      const totalHours = taskTimeEntries.reduce((acc, timeEntry) => {
        const milliseconds = timeEntry.durationMilliseconds
        const hours = milliseconds / 1000 / 60 / 60
        return acc + hours
      }, 0)

      timeEntriesByTask[task._id] = {taskTimeEntries, totalHours}
    })

    return timeEntriesByTask
  }, [timeEntries, tasks])

  const tasksByProject: TasksByProject = useMemo(() => {
    if (!tasks || !projects) return {}

    const tasksByProject: Record<
      string,
      {projectTasks: Task[]; totalHours: number}
    > = {}

    projects.forEach((project) => {
      const projectTasks = tasks.filter((task) => task.project === project._id)
      const totalHours = projectTasks.reduce((acc, task) => {
        const taskHours = timeEntriesByTask[task._id]?.totalHours || 0
        return acc + taskHours
      }, 0)

      tasksByProject[project._id] = {projectTasks, totalHours}
    })

    return tasksByProject
  }, [tasks])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  if (!projects || !tasks || !users || !timeEntries) {
    return <Loading />
  }

  return (
    <Container maxWidth="md">
      <PageHeader title="Reports" />

      <Widgets tasksByProject={tasksByProject} projects={projects} />

      <Box>
        {Object.entries(tasksByProject)
          .sort(
            (a, b) =>
              b[1].totalHours - a[1].totalHours || a[0].localeCompare(b[0])
          )
          .map(([projectId, {projectTasks, totalHours}]) => {
            const project = projects.find((p) => p._id === projectId)

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
                    {formatDollars((project?.rate ?? 0) * totalHours, false)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{p: 0}}>
                  {projectTasks.length === 0 && (
                    <Typography mx={2}>No time spent</Typography>
                  )}
                  <List>
                    {projectTasks
                      .sort(
                        (a, b) =>
                          timeEntriesByTask[b._id].totalHours -
                          timeEntriesByTask[a._id].totalHours
                      )
                      .map((task) => {
                        const totalHours =
                          timeEntriesByTask[task._id].totalHours
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
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          })}
      </Box>
    </Container>
  )
}

function getCurrentSelectedMonth(): SelectedMonth {
  const date = new Date()
  return {
    monthIndex: date.getMonth(),
    year: date.getFullYear()
  }
}

function getSelectedMonthDateRange(selectedMonth: SelectedMonth): [Date, Date] {
  const startOfMonth = dayjs()
    .year(selectedMonth.year)
    .month(selectedMonth.monthIndex)
    .startOf("month")
    .toDate()

  const endOfMonth = dayjs()
    .year(selectedMonth.year)
    .month(selectedMonth.monthIndex)
    .endOf("month")
    .toDate()

  return [startOfMonth, endOfMonth]
}

export default Reports
