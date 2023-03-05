import {Autocomplete, Container, Divider, Stack, TextField} from "@mui/material"
import {Project, TaskState} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from "react"
import {DndProvider} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {AuthContext} from "utils/context"
import {AnnotatedTask, useAnnotatedEndpoints} from "utils/useAnnotatedEndpoints"
import {TaskStateColumn} from "./TaskStateColumn"

const hiddenTaskStates: TaskState[] = [TaskState.Cancelled, TaskState.Delivered]

export const ProjectView: FC = () => {
  const {session, currentUser} = useContext(AuthContext)
  const {annotatedTaskEndpoint} = useAnnotatedEndpoints()

  const [state, dispatch] = useReducer(reducer, {status: "loadingProjects"})

  useEffect(() => {
    session.project
      .query({orderBy: ["name"]})
      .then((projects) =>
        dispatch({
          type: "setProjects",
          projects,
          selected:
            projects.find((p) =>
              currentUser.defaultFilters.projects.includes(p._id)
            ) ?? projects[0]
        })
      )
      .catch(() => dispatch({type: "error"}))
  }, [])

  useEffect(() => {
    if (!("selected" in state)) return

    annotatedTaskEndpoint
      .query({
        condition: {
          And: [
            {project: {Equal: state.selected._id}},
            {state: {NotInside: hiddenTaskStates}}
          ]
        }
      })
      .then((tasks) => dispatch({type: "setTasks", tasks}))
  }, ["selected" in state && state.selected._id])

  const tasksByState: Record<TaskState, AnnotatedTask[]> = useMemo(() => {
    const map: Record<TaskState, AnnotatedTask[]> = {
      [TaskState.Active]: [],
      [TaskState.Delivered]: [],
      [TaskState.Hold]: [],
      [TaskState.Testing]: [],
      [TaskState.Approved]: [], // Unused
      [TaskState.Cancelled]: [] // Unused
    }

    if ("tasks" in state) {
      state.tasks
        .sort((a, b) => {
          if (a.emergency && !b.emergency) return -1
          if (!a.emergency && b.emergency) return 1
          if (a.user === currentUser._id && b.user !== currentUser._id)
            return -1
          if (a.user !== currentUser._id && b.user === currentUser._id) return 1
          return dayjs(a.createdAt).diff(dayjs(b.createdAt))
        })
        .forEach((task) => map[task.state].push(task))
    }

    return map
  }, ["tasks" in state && state.tasks])

  const handleDrop = useCallback(
    (task: AnnotatedTask, newState: TaskState) => {
      if (!("tasks" in state)) return

      const previousState = task.state
      dispatch({
        type: "updateTask",
        taskId: task._id,
        updates: {state: newState}
      })

      annotatedTaskEndpoint
        .modify(task._id, {state: {Assign: newState}})
        .catch(() => {
          alert("Error updating task state")
          dispatch({
            type: "updateTask",
            taskId: task._id,
            updates: {state: previousState}
          })
        })
    },
    [state]
  )

  if (state.status === "loadingProjects") return <Loading />
  if (state.status === "error") return <ErrorAlert>Error occurred</ErrorAlert>

  return (
    <Container maxWidth="xl">
      <PageHeader title="Project View">
        <Autocomplete
          disableClearable
          options={state.projects.sort((a, _) =>
            currentUser.defaultFilters.projects.includes(a._id) ? -1 : 1
          )}
          onChange={(_, newValue) =>
            dispatch({type: "changeProject", selected: newValue})
          }
          value={state.selected}
          sx={{width: 300}}
          renderInput={(params) => <TextField {...params} label="Project" />}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option._id === value._id}
          groupBy={(option) =>
            currentUser.defaultFilters.projects.includes(option._id)
              ? "My Projects"
              : "Other Projects"
          }
        />
      </PageHeader>

      <DndProvider backend={HTML5Backend}>
        <Stack
          direction="row"
          spacing={1}
          sx={{overflowX: "auto"}}
          divider={<Divider orientation="vertical" flexItem />}
        >
          {Object.values(TaskState)
            .filter((taskState) => !hiddenTaskStates.includes(taskState))
            .map((taskState) => (
              <TaskStateColumn
                key={taskState}
                state={taskState}
                tasks={"tasks" in state ? tasksByState[taskState] : undefined}
                handleDrop={handleDrop}
              />
            ))}
        </Stack>
      </DndProvider>
    </Container>
  )
}

type State =
  | {status: "loadingProjects"}
  | {status: "loadingTasks"; projects: Project[]; selected: Project}
  | {
      status: "ready"
      projects: Project[]
      tasks: AnnotatedTask[]
      selected: Project
    }
  | {status: "error"}

type Action =
  | {type: "loadingProjects"}
  | {type: "setProjects"; projects: Project[]; selected: Project}
  | {type: "setTasks"; tasks: AnnotatedTask[]}
  | {type: "updateTask"; taskId: string; updates: Partial<AnnotatedTask>}
  | {type: "changeProject"; selected: Project}
  | {type: "error"}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loadingProjects":
      return {status: "loadingProjects"}
    case "setProjects":
      return {
        status: "loadingTasks",
        projects: action.projects,
        selected: action.selected
      }
    case "setTasks":
      if (state.status !== "loadingTasks") {
        throw new Error("Cannot set tasks when not loading tasks")
      }
      return {
        status: "ready",
        projects: state.projects,
        tasks: action.tasks,
        selected: state.selected
      }
    case "updateTask":
      if (state.status !== "ready") {
        throw new Error("Cannot update task when not ready")
      }
      return {
        status: "ready",
        projects: state.projects,
        tasks: state.tasks.map((task) =>
          task._id === action.taskId ? {...task, ...action.updates} : task
        ),
        selected: state.selected
      }
    case "changeProject":
      if (!("projects" in state)) {
        throw new Error("Cannot change project when loading projects")
      }
      return {
        status: "loadingTasks",
        projects: state.projects,
        selected: action.selected
      }
    case "error":
      return {status: "error"}
  }
}
