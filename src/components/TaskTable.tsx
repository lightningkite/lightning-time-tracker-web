import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC} from "react"
import {AnnotatedTask, useAnnotatedEndpoints} from "utils/useAnnotatedEndpoints"

dayjs.extend(duration)

export interface TaskTableProps
  extends Partial<RestDataTableProps<AnnotatedTask>> {
  hiddenColumns?: string[]
}

export const TaskTable: FC<TaskTableProps> = (props) => {
  const {...restProps} = props
  const {annotatedTaskEndpoint} = useAnnotatedEndpoints()

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
          valueFormatter: ({value}) => dayjs(value).fromNow()
        },
        {
          field: "user",
          headerName: "User",
          minWidth: 200,
          valueGetter: ({row}) =>
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            row.annotations.user?.name || row.annotations.user?.email,
          sortable: false
        },
        {
          field: "summary",
          headerName: "Summary",
          flex: 1,
          minWidth: 200
        },
        {
          field: "estimate",
          headerName: "Estimate",
          minWidth: 100,
          type: "number"
        },
        {
          field: "budget",
          headerName: "Budget",
          minWidth: 100,
          type: "number",
          sortable: false,
          valueGetter: ({row}) =>
            row.estimate ? row.annotations.totalTaskHours / row.estimate : null,
          valueFormatter: ({value}) =>
            value ? `${Math.round((value as number) * 100)}%` : "–"
        }
      ]}
    />
  )
}
