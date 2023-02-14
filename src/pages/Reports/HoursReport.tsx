import {Box, Card} from "@mui/material"
import {DataGrid, GridEnrichedColDef} from "@mui/x-data-grid"
import {TimeEntry, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {DateRange} from "./DateRangeSelector"

interface HoursTableRow {
  user: User
  dayHours: Record<string, number>
}

export const HoursReport: FC<{dateRange: DateRange}> = ({dateRange}) => {
  const {session} = useContext(AuthContext)

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>()
  const [users, setUsers] = useState<User[]>()

  const [error, setError] = useState("")

  useEffect(() => {
    session.user
      .query({})
      .then(setUsers)
      .catch(() => setError("Error fetching users"))
  }, [])

  useEffect(() => {
    setTimeEntries(undefined)

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
    if (!timeEntries || !users) {
      return []
    }

    const dayHoursByUserId: Record<string, Record<string, number>> = {}

    users.forEach((user) => {
      dayHoursByUserId[user._id] = {}
    })

    timeEntries.forEach((timeEntry) => {
      const date = dayjs(timeEntry.date).format("YYYY-MM-DD")

      dayHoursByUserId[timeEntry.user][date] =
        (dayHoursByUserId[timeEntry.user][date] ?? 0) +
        timeEntry.durationMilliseconds / MILLISECONDS_PER_HOUR
    })

    return users.map((user) => ({
      user,
      dayHours: dayHoursByUserId[user._id]
    }))
  }, [timeEntries, users])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }
  if (!users || !timeEntries) {
    return <Loading />
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        columns={[
          {
            field: "user",
            headerName: "User",
            width: 200,
            valueGetter: ({row}) => row.user.name || row.user.email
          },
          {
            field: "total",
            headerName: "Total",
            width: 100,
            valueGetter: ({row}) =>
              Object.values(row.dayHours)
                .reduce((a, b) => a + b, 0)
                .toFixed(1)
          },
          ...Array.from(
            {length: dateRange.end.diff(dateRange.start, "day") + 1},
            (_, i) => {
              const date = dateRange.start.add(i, "day")

              const column: GridEnrichedColDef<HoursTableRow> = {
                field: date.format("YYYY-MM-DD"),
                headerName: date.format("MMM D"),
                minWidth: 80,
                flex: 1,
                valueGetter: ({row}) =>
                  row.dayHours[date.format("YYYY-MM-DD")]?.toFixed(1)
              }

              return column
            }
          )
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
