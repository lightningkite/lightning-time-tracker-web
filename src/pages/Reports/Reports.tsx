import {ExpandMore} from "@mui/icons-material"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
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
import {DateRangeSelector, SelectedMonth} from "./DateRangeSelector"
import {Widgets} from "./Widgets"

export type SummarizeByProject = Record<
  string,
  {projectTasks: Task[]; projectHours: number}
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

      const totalHours = totalHoursForTimeEntries(taskTimeEntries)
      timeEntriesByTask[task._id] = {taskTimeEntries, totalHours}
    })

    return timeEntriesByTask
  }, [timeEntries, tasks])

  const summarizeByProject: SummarizeByProject = useMemo(() => {
    if (!tasks || !projects || !timeEntries) return {}

    const tasksByProject: Record<
      string,
      {projectTasks: Task[]; projectHours: number}
    > = {}

    projects.forEach((project) => {
      const projectTasks = tasks.filter((task) => task.project === project._id)
      const projectHours = totalHoursForTimeEntries(
        timeEntries.filter((t) => t.project === project._id)
      )

      tasksByProject[project._id] = {projectTasks, projectHours}
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
      <PageHeader title="Reports">
        <DateRangeSelector setSelectedMonth={setSelectedMonth} />
      </PageHeader>

      <Widgets
        tasksByProject={summarizeByProject}
        projects={projects}
        isCurrentMonth={
          selectedMonth.monthIndex === getCurrentSelectedMonth().monthIndex &&
          selectedMonth.year === getCurrentSelectedMonth().year
        }
      />

      <Box>
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
    </Container>
  )
}

function totalHoursForTimeEntries(timeEntries: TimeEntry[]): number {
  return timeEntries.reduce((acc, timeEntry) => {
    const milliseconds = timeEntry.durationMilliseconds
    const hours = milliseconds / 1000 / 60 / 60
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return acc + hours
  }, 0)
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
