import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC} from "react"
import {dynamicFormatDate} from "utils/helpers"
import {AnnotatedTask, useAnnotatedTasks} from "utils/useAnnotatedTasks"

dayjs.extend(duration)

export interface TaskTableProps
  extends Partial<RestDataTableProps<AnnotatedTask>> {
  hiddenColumns?: string[]
}

export const TaskTable: FC<TaskTableProps> = (props) => {
  const {...restProps} = props
  const annotatedTaskEndpoint = useAnnotatedTasks()

  return (
    <RestDataTable
      {...restProps}
      restEndpoint={annotatedTaskEndpoint}
      searchFields={["summary"]}
      defaultSorting={[{field: "createdAt", sort: "desc"}]}
      columns={[
        {
          field: "state",
          headerName: "State",
          minWidth: 100
        },
        {
          field: "createdAt",
          headerName: "Created",
          type: "date",
          width: 130,
          valueFormatter: ({value}) => dynamicFormatDate(dayjs(value))
        },
        {
          field: "userName",
          headerName: "User",
          minWidth: 200,
          valueGetter: ({row}) =>
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            row._annotations.user?.name || row._annotations.user?.email,
          sortable: false
        },
        {
          field: "summary",
          headerName: "Summary",
          flex: 1,
          minWidth: 200
        },
        {
          field: "timeSpent",
          headerName: "Time Spent",
          minWidth: 100,
          type: "number",
          valueGetter: ({row}) => row._annotations.totalTaskHours,
          valueFormatter: ({value}) => value.toFixed(1),
          sortable: false
        },
        {
          field: "budget",
          headerName: "% Estimated",
          minWidth: 100,
          type: "number",
          sortable: false,
          valueGetter: ({row}) =>
            row.estimate
              ? row._annotations.totalTaskHours / row.estimate
              : null,
          valueFormatter: ({value}) =>
            value ? `${Math.round((value as number) * 100)}%` : "–"
        }
      ]}
    />
  )
}
