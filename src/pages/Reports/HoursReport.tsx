import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {Card} from "@mui/material"
import {DataGrid, GridEnrichedColDef} from "@mui/x-data-grid"
import {User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {DateRange} from "./DateRangeSelector"

interface HoursTableRow {
  user: User
  dayMilliseconds: Record<string, number | null | undefined>
}

export const HoursReport: FC<{dateRange: DateRange}> = ({dateRange}) => {
  const {session} = useContext(AuthContext)

  const [tableData, setTableData] = useState<HoursTableRow[]>()
  const [users, setUsers] = useState<User[]>()

  const [error, setError] = useState("")

  useEffect(() => {
    session.user
      .query({})
      .then(setUsers)
      .catch(() => setError("Error fetching users"))
  }, [])

  useEffect(() => {
    setTableData(undefined)

    if (!users) {
      return
    }

    const requests: Promise<HoursTableRow["dayMilliseconds"]>[] = users.map(
      (user) =>
        session.timeEntry.groupAggregate({
          condition: {
            And: [
              {user: {Equal: user._id}},
              {date: {GreaterThanOrEqual: dateToISO(dateRange.start.toDate())}},
              {date: {LessThanOrEqual: dateToISO(dateRange.end.toDate())}}
            ]
          },
          aggregate: Aggregate.Sum,
          property: "durationMilliseconds",
          groupBy: "date"
        })
    )

    Promise.all(requests).then((r) =>
      setTableData(
        r.map((dayMilliseconds, i) => ({
          user: users[i],
          dayMilliseconds
        }))
      )
    )
  }, [dateRange, users])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        loading={!users || !tableData}
        disableSelectionOnClick
        disableColumnMenu
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
            width: 80,
            type: "number",
            valueGetter: ({row}) =>
              Object.values(row.dayMilliseconds).reduce<number>(
                (acc, milliseconds) => acc + (milliseconds ?? 0),
                0
              ),
            valueFormatter: ({value}) =>
              (value / MILLISECONDS_PER_HOUR).toFixed(1)
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
                type: "number",
                valueGetter: ({row}) =>
                  row.dayMilliseconds[date.format("YYYY-MM-DD")],
                valueFormatter: ({value}) =>
                  value ? (value / MILLISECONDS_PER_HOUR).toFixed(1) : "–"
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
        rows={tableData ?? []}
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
