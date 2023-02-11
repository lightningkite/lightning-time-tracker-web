import {Container} from "@mui/material"
import {Project, Task, TimeEntry, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"

interface SelectedMonth {
  monthIndex: number
  year: number
}

const Reports: FC = () => {
  const {session} = useContext(AuthContext)

  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(
    getCurrentSelectedMonth()
  )
  const [projects, setProjects] = useState<Project[]>()
  const [tasks, setTasks] = useState<Task[]>()
  const [users, setUsers] = useState<User[]>()
  const [timerEntries, setTimeEntries] = useState<TimeEntry[]>()

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
    if (!timerEntries) return

    const uniqueTaskIds = new Set(
      timerEntries.reduce<string[]>((acc, timerEntry) => {
        timerEntry.task && acc.push(timerEntry.task)
        return acc
      }, [])
    )

    session.task
      .query({
        condition: {_id: {Inside: Array.from(uniqueTaskIds)}}
      })
      .then(setTasks)
      .catch(() => setError("Error fetching tasks"))
  }, [timerEntries])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  if (!projects || !tasks || !users || !timerEntries) {
    return <Loading />
  }

  return (
    <Container maxWidth="md">
      <PageHeader title="Reports" />
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
