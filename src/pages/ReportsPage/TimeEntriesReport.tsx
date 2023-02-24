import {Card} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import {TimeEntry} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext, useEffect, useState} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {dynamicFormatDate, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {CustomToolbar} from "./CustomToolbar"
import {filtersToTimeEntryCondition} from "./ReportFilters"
import {ReportProps} from "./ReportsPage"

dayjs.extend(duration)

export const TimeEntriesReport: FC<ReportProps> = (props) => {
  const {reportFilterValues} = props
  const {session} = useContext(AuthContext)

  const [tableData, setTableData] = useState<TimeEntry[]>()

  const [error, setError] = useState("")

  async function fetchReportData() {
    setTableData(undefined)

    const timeEntries = await session.timeEntry.query({
      condition: filtersToTimeEntryCondition(reportFilterValues),
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
        disableSelectionOnClick
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
