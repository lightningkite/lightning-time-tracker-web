import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {Alert, Card} from "@mui/material"
import {DataGrid, GridEnrichedColDef} from "@mui/x-data-grid"
import {User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {MILLISECONDS_PER_HOUR} from "utils/helpers"
import {
  filtersToTimeEntryCondition,
  filtersToUserCondition
} from "./ReportFilters"
import {ReportProps} from "./ReportsPage"

interface HoursTableRow {
  user: User
  dayMilliseconds: Record<string, number | null | undefined>
}

export const HoursReport: FC<ReportProps> = (props) => {
  const {reportFilterValues} = props
  const {dateRange} = reportFilterValues
  const {session} = useContext(AuthContext)

  const [tableData, setTableData] = useState<HoursTableRow[]>()
  const [users, setUsers] = useState<User[]>()

  const [error, setError] = useState("")

  async function fetchReportData() {
    setTableData(undefined)

    const users = await session.user.query({
      condition: filtersToUserCondition(reportFilterValues)
    })

    setUsers(users)

    const userHoursRequest: Promise<HoursTableRow["dayMilliseconds"]>[] =
      users.map((user) =>
        session.timeEntry.groupAggregate({
          condition: {
            And: [
              {user: {Equal: user._id}},
              filtersToTimeEntryCondition(reportFilterValues)
            ]
          },
          aggregate: Aggregate.Sum,
          property: "durationMilliseconds",
          groupBy: "date"
        })
      )

    const userHoursResponse = await Promise.all(userHoursRequest)

    setTableData(
      userHoursResponse.map((dayMilliseconds, i) => ({
        user: users[i],
        dayMilliseconds
      }))
    )
  }

  useEffect(() => {
    fetchReportData().catch(() => setError("Error fetching report data"))
  }, [reportFilterValues])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  if (!dateRange) {
    return (
      <Alert severity="info">
        Select a date range to view the hours report.
      </Alert>
    )
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
                  row.dayMilliseconds[date.format("YYYY-MM-DD")] ?? 0,
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
