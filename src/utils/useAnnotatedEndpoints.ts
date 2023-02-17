import {
  Aggregate,
  annotateEndpoint,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {Project, Task, TimeEntry, User} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "utils/context"

export type AnnotatedTask = WithAnnotations<
  Task,
  {user?: User; totalTaskHours: number}
>

export type AnnotatedTimeEntry = WithAnnotations<
  TimeEntry,
  {task?: Task; project?: Project; user?: User}
>

export interface UseAnnotatedEndpointsReturn {
  annotatedTaskEndpoint: SessionRestEndpoint<AnnotatedTask>
  annotatedTimeEntryEndpoint: SessionRestEndpoint<AnnotatedTimeEntry>
}

export const useAnnotatedEndpoints = (): UseAnnotatedEndpointsReturn => {
  const {session} = useContext(AuthContext)

  // ***********************************
  // TASKS
  // ***********************************

  const annotatedTaskEndpoint: SessionRestEndpoint<AnnotatedTask> =
    annotateEndpoint(session.task, async (tasks) => {
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
        _annotations: {
          user: users.find((user) => user._id === task.user),
          totalTaskHours: (taskTimeAggregates[task._id] ?? 0) / (3600 * 1000)
        }
      }))
    })

  // ***********************************
  // TIME ENTRIES
  // ***********************************

  const annotatedTimeEntryEndpoint: SessionRestEndpoint<AnnotatedTimeEntry> =
    annotateEndpoint(session.timeEntry, async (timeEntries: TimeEntry[]) => {
      const taskIds = new Set<string>()
      const projectIds = new Set<string>()
      const userIds = new Set<string>()

      timeEntries.forEach((timeEntry) => {
        userIds.add(timeEntry.user)
        timeEntry.task && taskIds.add(timeEntry.task)
        projectIds.add(timeEntry.project)
      })

      const [tasks, projects, users] = await Promise.all([
        session.task.query({condition: {_id: {Inside: [...taskIds]}}}),
        session.project.query({condition: {_id: {Inside: [...projectIds]}}}),
        session.user.query({condition: {_id: {Inside: [...userIds]}}})
      ])

      return timeEntries.map((timeEntry) => ({
        ...timeEntry,
        _annotations: {
          user: users.find((user) => user._id === timeEntry.user),
          task: tasks.find((task) => task._id === timeEntry.task),
          project: projects.find((project) => project._id === timeEntry.project)
        }
      }))
    })

  return {
    annotatedTaskEndpoint,
    annotatedTimeEntryEndpoint
  }
}
