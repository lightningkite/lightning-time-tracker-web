import {
  annotateEndpoint,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Alert, AlertTitle, Container} from "@mui/material"
import {Project, Task, TimeEntry} from "api/sdk"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import {AddTimeEntryButton} from "./AddTimeEntry"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export const TimeEntryIndex: FC = () => {
  const {session, currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [weeklyTime, setWeeklyTime] = useState(dayjs.duration(0, "minutes"))

  useEffect(() => {
    session.timeEntry
      .query({
        condition: {
          And: [
            {user: {Equal: currentUser._id}},
            {
              date: {
                GreaterThanOrEqual: dateToISO(dayjs().startOf("week").toDate())
              }
            }
          ]
        }
      })
      .then((timeEntries) => {
        const durations = timeEntries.map((timeEntry) =>
          dayjs.duration(timeEntry.duration)
        )
        const totalTime = durations.reduce(
          (prev, curr) => prev.add(curr),
          dayjs.duration(0, "minutes")
        )
        setWeeklyTime(totalTime)
      })
  }, [refreshTrigger])

  const annotatedTimeEntryEndpoint: SessionRestEndpoint<
    WithAnnotations<TimeEntry, {task?: Task; project?: Project}>
  > = annotateEndpoint(session.timeEntry, async (timeEntries) => {
    const taskIds = new Set<string>()
    const projectIds = new Set<string>()

    timeEntries.forEach((timeEntry) => {
      timeEntry.task && taskIds.add(timeEntry.task)
      timeEntry.project && projectIds.add(timeEntry.project)
    })

    const [tasks, projects] = await Promise.all([
      session.task.query({condition: {_id: {Inside: [...taskIds]}}}),
      session.project.query({condition: {_id: {Inside: [...projectIds]}}})
    ])

    return timeEntries.map((timeEntry) => ({
      ...timeEntry,
      annotations: {
        task: tasks.find((task) => task._id === timeEntry.task),
        project: projects.find((project) => project._id === timeEntry.project)
      }
    }))
  })

  return (
    <Container maxWidth="lg">
      <PageHeader title="My Time Entries">
        <AddTimeEntryButton
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </PageHeader>

      <Alert severity="info" sx={{mb: 2}} variant="outlined">
        <AlertTitle>Weekly Time</AlertTitle>
        You have worked {weeklyTime.format("HH:mm")} this week.
      </Alert>

      <RestDataTable
        restEndpoint={annotatedTimeEntryEndpoint}
        additionalQueryConditions={[{user: {Equal: currentUser._id}}]}
        dependencies={[refreshTrigger]}
        defaultSorting={[{field: "date", sort: "desc"}]}
        columns={[
          {
            field: "date",
            headerName: "Date",
            valueGetter: (params) =>
              dayjs(params.row.date).format("MM/DD/YYYY"),
            type: "date"
          },
          {
            field: "duration",
            headerName: "Duration",
            valueGetter: (params) =>
              dayjs.duration(params.row.duration).format("HH:mm")
          },
          {
            field: "project",
            headerName: "Project",
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => params.row.annotations.project?.name
          },
          {
            field: "task",
            headerName: "Task",
            flex: 2,
            minWidth: 200,
            valueGetter: (params) => params.row.annotations.task?.description
          },
          {
            field: "summary",
            headerName: "Summary",
            flex: 2,
            minWidth: 200
          }
        ]}
      />
    </Container>
  )
}
