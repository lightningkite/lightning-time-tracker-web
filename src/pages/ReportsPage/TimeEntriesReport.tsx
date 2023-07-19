import {Card} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import type {TimeEntry} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {MILLISECONDS_PER_HOUR, dynamicFormatDate} from "utils/helpers"
import {CustomToolbar} from "./CustomToolbar"
import {filtersToTimeEntryCondition} from "./ReportFilters"
import type {ReportProps} from "./ReportsPage"

dayjs.extend(duration)

export const TimeEntriesReport: FC<ReportProps> = (props) => {
  const {reportFilterValues} = props
  const {session, currentUser} = useContext(AuthContext)

  const [tableData, setTableData] = useState<TimeEntry[]>()

  const [error, setError] = useState("")

  async function fetchReportData() {
    setTableData(undefined)

    const timeEntries = await session.timeEntry.query({
      condition: {
        And: [
          filtersToTimeEntryCondition(reportFilterValues),
          {organization: {Equal: currentUser.organization}}
        ]
      },
      limit: QUERY_LIMIT
    })

    setTableData(timeEntries)
  }

  useEffect(() => {
    fetchReportData().catch(() => setError("Error fetching report data"))
  }, [reportFilterValues])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        loading={!tableData}
        disableRowSelectionOnClick
        disableColumnMenu
        columns={[
          {
            field: "date",
            headerName: "Date",
            type: "date",
            width: 130,
            renderCell: ({value}) => dynamicFormatDate(dayjs(value))
          },
          {
            field: "userName",
            headerName: "User",
            width: 150
          },
          {
            field: "duration",
            headerName: "Duration",
            valueGetter: (params) =>
              params.row.durationMilliseconds / MILLISECONDS_PER_HOUR,
            valueFormatter: ({value}) => value.toFixed(2),
            renderCell: ({value}) =>
              dayjs.duration(value, "hour").format("HH : mm : ss")
          },
          {
            field: "projectName",
            headerName: "Project",
            width: 200
          },
          {
            field: "taskSummary",
            headerName: "Task",
            flex: 2,
            minWidth: 200
          },
          {
            field: "summary",
            headerName: "Summary",
            flex: 3,
            minWidth: 200
          }
        ]}
        initialState={{
          sorting: {
            sortModel: [{field: "date", sort: "desc"}]
          }
        }}
        rows={tableData ?? []}
        getRowId={(r) => r._id}
        components={{Toolbar: CustomToolbar}}
        componentsProps={{
          toolbar: {
            filters: reportFilterValues,
            filePrefix: "Time Entries"
          }
        }}
        sx={{
          "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
            outline: "none !important"
          }
        }}
      />
    </Card>
  )
}
