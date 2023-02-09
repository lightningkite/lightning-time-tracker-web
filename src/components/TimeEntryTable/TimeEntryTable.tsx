import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import {TimeEntry} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import React, {FC, useState} from "react"
import {
  AnnotatedTimeEntry,
  useAnnotatedEndpoints
} from "utils/useAnnotatedEndpoints"
import {TimeEntryModal} from "./TimeEntryModal"

dayjs.extend(relativeTime)
dayjs.extend(duration)

export interface TimeEntryTableProps
  extends Partial<RestDataTableProps<AnnotatedTimeEntry>> {
  hiddenColumns?: string[]
}

export const TimeEntryTable: FC<TimeEntryTableProps> = (props) => {
  const {hiddenColumns = [], ...restProps} = props
  const {annotatedTimeEntryEndpoint} = useAnnotatedEndpoints()

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(
    null
  )

  const columns: RestDataTableProps<AnnotatedTimeEntry>["columns"] = [
    {
      field: "date",
      headerName: "Date",
      type: "date",
      width: 130,
      valueFormatter: ({value}) => {
        if (dayjs().isSame(value, "day")) return "Today"
        if (dayjs().subtract(1, "day").isSame(value, "day")) return "Yesterday"
        return dayjs(value).fromNow()
      }
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
      valueGetter: (params) => params.row.annotations.task?.summary
    },
    {
      field: "user",
      headerName: "User",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.annotations.user?.email
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
        restEndpoint={annotatedTimeEntryEndpoint}
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
