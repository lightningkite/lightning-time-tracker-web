import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import {TimeEntry} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import React, {FC, useEffect, useState} from "react"
import {JoinedQueryType, useQueryJoin} from "utils/useQueryJoin"
import {TimeEntryModal} from "./TimeEntryModal"

dayjs.extend(relativeTime)
dayjs.extend(duration)

export type AnnotatedTimeEntry = JoinedQueryType<
  "timeEntry",
  "task" | "project" | "user"
>

export interface TimeEntryTableProps
  extends Partial<RestDataTableProps<AnnotatedTimeEntry>> {
  hiddenColumns?: string[]
}

export const TimeEntryTable: FC<TimeEntryTableProps> = (props) => {
  const {hiddenColumns = [], ...restProps} = props

  const annotatedTimeEntryEndpoint = useQueryJoin({
    baseKey: "timeEntry",
    annotationKeys: ["task", "project", "user"].filter(
      (key) => !hiddenColumns.includes(key)
    ) as ("task" | "project" | "user")[]
  })

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(
    null
  )

  useEffect(() => {
    annotatedTimeEntryEndpoint
      .query({
        condition: {date: {Equal: dayjs().format("YYYY-MM-DD")}}
      })
      .then(console.log)
  }, [])

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
      valueGetter: (params) => params.row._annotations.project?.name
    },
    {
      field: "task",
      headerName: "Task",
      flex: 2,
      minWidth: 200,
      valueGetter: (params) => params.row._annotations.task?.summary
    },
    {
      field: "user",
      headerName: "User",
      flex: 1,
      minWidth: 200,
      valueGetter: ({row}) =>
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        row._annotations.user?.name || row._annotations.user?.email,
      sortable: false
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
