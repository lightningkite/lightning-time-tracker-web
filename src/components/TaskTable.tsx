import {
  annotateEndpoint,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {
  RestDataTable,
  RestDataTableProps
} from "@lightningkite/mui-lightning-components"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

dayjs.extend(duration)

export type AnnotatedTask = WithAnnotations<Task, {user?: User}>

export interface TaskTableProps
  extends Partial<RestDataTableProps<AnnotatedTask>> {
  // hiddenColumns?: string[]
}

export const TaskTable: FC<TaskTableProps> = (props) => {
  const {...restProps} = props
  const {session} = useContext(AuthContext)

  const annotatedTaskEndpoint: SessionRestEndpoint<AnnotatedTask> =
    annotateEndpoint(session.task, async (tasks) => {
      const userIds = new Set<string>()

      tasks.forEach((timeEntry) => {
        userIds.add(timeEntry.user)
      })

      const [users] = await Promise.all([
        session.user.query({condition: {_id: {Inside: [...userIds]}}})
      ])

      return tasks.map((timeEntry) => ({
        ...timeEntry,
        annotations: {
          user: users.find((user) => user._id === timeEntry.user)
        }
      }))
    })

  return (
    <RestDataTable
      {...restProps}
      restEndpoint={annotatedTaskEndpoint}
      searchFields={["description"]}
      columns={[
        {
          field: "state",
          headerName: "State",
          minWidth: 100
        },
        {
          field: "user",
          headerName: "User",
          minWidth: 250,
          valueGetter: (params) => params.row.annotations.user?.email
        },
        {
          field: "description",
          headerName: "Description",
          flex: 1,
          minWidth: 200
        },
        {
          field: "estimate",
          headerName: "Estimate",
          minWidth: 100,
          type: "number"
        }
      ]}
    />
  )
}
