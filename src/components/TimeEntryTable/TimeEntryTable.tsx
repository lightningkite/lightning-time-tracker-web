import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import {TimeEntry} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {dynamicFormatDate} from "utils/helpers"
import {TimeEntryModal} from "./TimeEntryModal"

dayjs.extend(relativeTime)
dayjs.extend(duration)

export interface TimeEntryTableProps
  extends Partial<RestDataTableProps<TimeEntry>> {
  hiddenColumns?: string[]
}

export const TimeEntryTable: FC<TimeEntryTableProps> = (props) => {
  const {hiddenColumns = [], ...restProps} = props
  const {session} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(
    null
  )

  const columns: RestDataTableProps<TimeEntry>["columns"] = [
    {
      field: "date",
      headerName: "Date",
      type: "date",
      width: 130,
      valueFormatter: ({value}) => dynamicFormatDate(dayjs(value))
    },
    {
      field: "duration",
      headerName: "Duration",
      valueGetter: (params) =>
        dayjs
          .duration(params.row.durationMilliseconds, "millisecond")
          .format("H : mm : ss")
    },
    {
      field: "projectName",
      headerName: "Project",
      flex: 1,
      minWidth: 200
    },
    {
      field: "taskSummary",
      headerName: "Task",
      flex: 2,
      minWidth: 200
    },
    {
      field: "userName",
      headerName: "User",
      flex: 1,
      minWidth: 200
    },
    {
      field: "summary",
      headerName: "Summary",
      flex: 2,
      minWidth: 200
    }
  ]

  return (
    <>
      <RestDataTable
        {...restProps}
        restEndpoint={session.timeEntry}
        defaultSorting={[{field: "date", sort: "desc"}]}
        columns={columns.filter(
          (column) => !hiddenColumns.includes(column.field)
        )}
        onRowClick={setSelectedTimeEntry}
        dependencies={[refreshTrigger, ...(props.dependencies ?? [])]}
      />
      <TimeEntryModal
        timeEntry={selectedTimeEntry}
        onClose={() => {
          setRefreshTrigger((prev) => prev + 1)
          setSelectedTimeEntry(null)
        }}
      />
    </>
  )
}
