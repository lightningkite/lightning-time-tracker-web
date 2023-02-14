import {Card} from "@mui/material"
import {DataGrid, GridEnrichedColDef} from "@mui/x-data-grid"
import {Project, TimeEntry, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {DateRange} from "./DateRangeSelector"

interface HoursTableRow {
  user: User
  projectHours: Record<string, number>
}

export const ProjectsReport: FC<{dateRange: DateRange}> = ({dateRange}) => {
  const {session} = useContext(AuthContext)

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>()
  const [users, setUsers] = useState<User[]>()
  const [projects, setProjects] = useState<Project[]>()

  const [error, setError] = useState("")

  useEffect(() => {
    session.user
      .query({})
      .then(setUsers)
      .catch(() => setError("Error fetching users"))
  }, [])

  useEffect(() => {
    setTimeEntries(undefined)
    setProjects(undefined)

    session.project
      .query({})
      .then(setProjects)
      .catch(() => setError("Error fetching projects"))

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

  const tableData: HoursTableRow[] = useMemo(() => {
    if (!timeEntries || !users || !projects) {
      return []
    }

    const projectHoursByUserId: Record<string, Record<string, number>> = {}

    users.forEach((user) => {
      projectHoursByUserId[user._id] = {}
    })

    timeEntries.forEach((timeEntry) => {
      projectHoursByUserId[timeEntry.user][timeEntry.project] =
        (projectHoursByUserId[timeEntry.user][timeEntry.project] ?? 0) +
        timeEntry.durationMilliseconds / MILLISECONDS_PER_HOUR
    })

    return users.map((user) => ({
      user,
      projectHours: projectHoursByUserId[user._id]
    }))
  }, [timeEntries, users, projects])

  const hoursByProject: Record<string, number> = useMemo(() => {
    const totals: Record<string, number> = {}

    tableData.forEach((row) => {
      Object.entries(row.projectHours).forEach(([projectId, hours]) => {
        totals[projectId] = (totals[projectId] ?? 0) + hours
      })
    })

    return totals
  }, [tableData])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        loading={!users || !timeEntries || !projects}
        disableSelectionOnClick
        disableColumnMenu
        columns={[
          {
            field: "user",
            headerName: "User",
            width: 200,
            valueGetter: ({row}) => row.user.name || row.user.email
          },
          // {
          //   field: "total",
          //   headerName: "Total",
          //   width: 80,
          //   valueGetter: ({row}) =>
          //     Object.values(row.projectHours)
          //       .reduce((a, b) => a + b, 0)
          //       .toFixed(1)
          // },
          ...(projects ?? [])
            .sort(
              (a, b) => hoursByProject[b._id] || 0 - hoursByProject[a._id] || 0
            )
            .map((project) => {
              const column: GridEnrichedColDef<HoursTableRow> = {
                field: project._id,
                headerName: project.name,
                minWidth: Math.min(200, project.name.length * 7 + 50),
                flex: 1,
                valueGetter: ({row}) =>
                  row.projectHours[project._id]?.toFixed(1) || "–"
              }

              return column
            })
        ]}
        initialState={{
          sorting: {
            sortModel: [{field: "user", sort: "asc"}]
          }
        }}
        rows={tableData}
        getRowId={(r) => r.user._id}
        hideFooter
        sx={{
          "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
            outline: "none !important"
          }
        }}
      />
    </Card>
  )
}
