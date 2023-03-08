import {
  Aggregate,
  annotateEndpoint,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {Task} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "utils/context"

export type AnnotatedTask = WithAnnotations<Task, {totalTaskHours: number}>

export interface UseAnnotatedEndpointsReturn {
  annotatedTaskEndpoint: SessionRestEndpoint<AnnotatedTask>
}

export const useAnnotatedEndpoints = (): UseAnnotatedEndpointsReturn => {
  const {session} = useContext(AuthContext)

  // ***********************************
  // TASKS
  // ***********************************

  const annotatedTaskEndpoint: SessionRestEndpoint<AnnotatedTask> =
    annotateEndpoint(session.task, async (tasks) => {
      const taskIds = new Set<string>()

      tasks.forEach((timeEntry) => {
        taskIds.add(timeEntry._id)
      })

      const [taskTimeAggregates] = await Promise.all([
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
          totalTaskHours: (taskTimeAggregates[task._id] ?? 0) / (3600 * 1000)
        }
      }))
    })

  return {
    annotatedTaskEndpoint
  }
}
