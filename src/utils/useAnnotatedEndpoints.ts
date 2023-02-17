import {
  Aggregate,
  annotateEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {Task, User} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "utils/context"

export interface TaskAnnotation {
  user?: User
  totalTaskHours: number
}
export type AnnotatedTask = WithAnnotations<Task, TaskAnnotation>

export interface UseAnnotatedEndpointsReturn {
  annotatedTaskEndpoint: ReturnType<
    typeof annotateEndpoint<Task, TaskAnnotation>
  >
}

export const useAnnotatedEndpoints = (): UseAnnotatedEndpointsReturn => {
  const {session} = useContext(AuthContext)

  // ***********************************
  // TASKS
  // ***********************************

  const annotatedTaskEndpoint = annotateEndpoint(
    session.task,
    async (tasks) => {
      const userIds = new Set<string>()
      const taskIds = new Set<string>()

      tasks.forEach((timeEntry) => {
        userIds.add(timeEntry.user)
        taskIds.add(timeEntry._id)
      })

      const [users, taskTimeAggregates] = await Promise.all([
        session.user.query({condition: {_id: {Inside: [...userIds]}}}),
        session.timeEntry.groupAggregate({
          aggregate: Aggregate.Sum,
          condition: {task: {Inside: [...taskIds]}},
          groupBy: "task",
          property: "durationMilliseconds"
        })
      ])

      return tasks.map((task) => ({
        ...task,
        annotations: {
          user: users.find((user) => user._id === task.user),
          totalTaskHours: (taskTimeAggregates[task._id] ?? 0) / (3600 * 1000)
        }
      }))
    }
  )

  return {
    annotatedTaskEndpoint
  }
}
