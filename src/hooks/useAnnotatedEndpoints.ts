import type {
  ReadonlySessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified";
import {
  Aggregate,
  annotateEndpoint
} from "@lightningkite/lightning-server-simplified"
import type {Task} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "utils/context"

export type AnnotatedTask = WithAnnotations<Task, {totalTaskHours: number}>

export interface UseAnnotatedEndpointsReturn {
  annotatedTaskEndpoint: ReadonlySessionRestEndpoint<AnnotatedTask>
}

export const useAnnotatedEndpoints = (): UseAnnotatedEndpointsReturn => {
  const {session} = useContext(AuthContext)

  // ***********************************
  // TASKS
  // ***********************************

  const annotatedTaskEndpoint: ReadonlySessionRestEndpoint<AnnotatedTask> =
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
        _annotations: {
          totalTaskHours: (taskTimeAggregates[task._id] ?? 0) / (3600 * 1000)
        }
      }))
    })

  return {
    annotatedTaskEndpoint
  }
}
