import {Container, Divider, Stack, useMediaQuery} from "@mui/material"
import type {Project, Task} from "api/sdk"
import {TaskState} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import dayjs from "dayjs"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {useAnnotatedEndpoints} from "hooks/useAnnotatedEndpoints"
import usePeriodicRefresh from "hooks/usePeriodicRefresh"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react"
import {DndProvider} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {useNavigate, useSearchParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {CompactColumn} from "./CompactColumn"
import {ProjectSwitcher} from "./ProjectSwitcher"
import {TaskStateColumn} from "./TaskStateColumn"
import {type Condition} from "@lightningkite/lightning-server-simplified"
import {HiddenTaskTable} from "./HiddenTaskTable"
import {
  ProjectBoardFilterBar,
  type ProjectBoardFilterBarValues,
  filtersToTaskProjectCondition,
  filtersToTaskUserCondition,
  filtersToTaskTagsCondition
} from "./ProjectBoardFilterBar"

export const ProjectBoard: FC = () => {
  const {session, currentUser} = useContext(AuthContext)
  const {annotatedTaskEndpoint} = useAnnotatedEndpoints()
  const permissions = usePermissions()
  const [urlParams, setUrlParams] = useSearchParams()
  const navigate = useNavigate()

  const [projectBoardFilterValues, setProjectBoardFilterValues] =
    useState<ProjectBoardFilterBarValues>()

  const [tableState, setTableState] = useState<
    "Delivered" | "Cancelled" | null
  >(null)

  const [state, dispatch] = useReducer(reducer, {status: "loadingProjects"})
  const taskRefreshTrigger = usePeriodicRefresh(10 * 60)
  const smallScreen = useMediaQuery("(max-width: 1400px)")

  const alwaysHiddenTaskStates = [TaskState.Cancelled, TaskState.Delivered]

  const hiddenTaskStates: TaskState[] = permissions.canViewTesting
    ? alwaysHiddenTaskStates
    : [
        ...alwaysHiddenTaskStates,
        TaskState.Hold,
        TaskState.Active,
        TaskState.PullRequest,
        TaskState.Testing
      ]

  const onChangeProject = (projects: Project[]) => {
    if (
      "selected" in state &&
      state.selected.map((p) => p._id) === projects.map((p) => p._id)
    )
      return
    urlParams.set("project", `${projects.map((p) => p._id + "-")}`)
    setUrlParams(urlParams)
    dispatch({type: "changeProject", selected: projects})
  }

  const projectUrl = urlParams.get("project")

  useEffect(() => {
    session.project
      .query({
        condition: {
          And: [{organization: {Equal: currentUser.organization}}]
        },
        orderBy: ["name"]
      })
      .then((projects) => {
        const projectFromQuery = projects.find(
          (p) => projectUrl?.includes(p._id)
        )
        const initialProject =
          projectFromQuery ??
          projects.find((p) => currentUser.projectFavorites.includes(p._id)) ??
          projects[0]
        urlParams.set("project", initialProject._id)
        setUrlParams(urlParams)

        if (projects.length === 0) {
          dispatch({type: "error", message: "No projects found"})
        } else {
          dispatch({
            type: "setProjects",
            projects,
            selected: [initialProject]
          })
        }
      })
      .catch(() =>
        dispatch({type: "error", message: "Failed to load projects"})
      )
  }, [])

  useEffect(() => {
    if (!("selected" in state)) return

    // Update selected project in query
    const searchParams = new URLSearchParams(location.search)
    searchParams.set("project", `${state.selected.map((p) => p._id).join(" ")}`)

    navigate({search: searchParams.toString()})

    const conditions: Condition<Task>[] = projectBoardFilterValues
      ? [
          {
            state: {NotInside: hiddenTaskStates}
          },
          projectBoardFilterValues.projects !== null
            ? filtersToTaskProjectCondition(projectBoardFilterValues)
            : {project: {Inside: state.selected.flatMap((p) => p._id)}},
          filtersToTaskUserCondition(projectBoardFilterValues),
          filtersToTaskTagsCondition(projectBoardFilterValues)
        ]
      : [
          {state: {NotInside: hiddenTaskStates}},
          {project: {Inside: state.selected.flatMap((p) => p._id)}}
        ]

    annotatedTaskEndpoint
      .query({condition: {And: conditions}, limit: 1000})
      .then((tasks: AnnotatedTask[]) => dispatch({type: "setTasks", tasks}))
  }, [
    "selected" in state && state.selected,
    taskRefreshTrigger,
    projectBoardFilterValues
  ])

  const tasksByState: Record<TaskState, AnnotatedTask[]> = useMemo(() => {
    const map: Record<TaskState, AnnotatedTask[]> = {
      [TaskState.Active]: [],
      [TaskState.Delivered]: [],
      [TaskState.PullRequest]: [],
      [TaskState.Hold]: [],
      [TaskState.Testing]: [],
      [TaskState.Approved]: [], // Unused
      [TaskState.Cancelled]: [], // Unused
      [TaskState.Ready]: [],
      [TaskState.Review]: [],
      [TaskState.HigherReview]: [],
      [TaskState.FinalReview]: [],
      [TaskState.PartialDelivery1]: [],
      [TaskState.PartialDelivery2]: []
    }

    if ("tasks" in state) {
      state.tasks
        .sort((a, b) => {
          if (a.emergency && !b.emergency) return -1
          if (!a.emergency && b.emergency) return 1
          if (a.user === currentUser._id && b.user !== currentUser._id)
            return -1
          if (a.user !== currentUser._id && b.user === currentUser._id) return 1
          const priorityDiff = b.priority - a.priority
          if (priorityDiff !== 0) return priorityDiff
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

      session.task.modify(task._id, {state: {Assign: newState}}).catch(() => {
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
  if (state.status === "error") return <ErrorAlert>{state.message}</ErrorAlert>

  return (
    <>
      <Container sx={{maxWidth: "2500px !important"}} disableGutters>
        <Stack
          direction={smallScreen ? "column-reverse" : "row"}
          sx={{mt: 1, mb: 2, ml: 2}}
          spacing={2}
          alignItems={"center"}
        >
          <ProjectSwitcher
            projects={state.projects}
            selected={state.selected[0]}
            onSelect={onChangeProject}
            disabled={projectBoardFilterValues?.projects !== null}
          />
        </Stack>
        <ProjectBoardFilterBar
          setProjectBoardFilterValues={setProjectBoardFilterValues}
          selectedProjects={
            projectBoardFilterValues?.projects ?? state.selected
          }
        />

        <DndProvider backend={HTML5Backend}>
          <Stack
            direction="row"
            spacing={1}
            sx={{overflowX: "auto", px: 2}}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {permissions.canManageAllTasks && (
              <CompactColumn
                onClick={() => {
                  setTableState("Cancelled")
                }}
                handleDrop={handleDrop}
                taskState={TaskState.Cancelled}
              />
            )}

            {Object.values(TaskState)
              .filter((taskState) => !hiddenTaskStates.includes(taskState))
              .map((taskState) => (
                <TaskStateColumn
                  key={taskState}
                  state={taskState}
                  showProject={
                    projectBoardFilterValues?.projects &&
                    projectBoardFilterValues?.projects.length > 1
                      ? true
                      : false
                  }
                  tasks={
                    state.status === "ready"
                      ? tasksByState[taskState]
                      : undefined
                  }
                  handleDrop={handleDrop}
                  projects={state.selected}
                  onAddedTask={(task) => dispatch({type: "addTask", task})}
                  updateTask={(updatedTask) =>
                    dispatch({
                      type: "updateTask",
                      taskId: updatedTask._id,
                      updates: updatedTask
                    })
                  }
                />
              ))}

            {(permissions.canManageAllTasks || permissions.canDeliverTasks) && (
              <CompactColumn
                onClick={() => {
                  setTableState("Delivered")
                }}
                handleDrop={handleDrop}
                taskState={TaskState.Delivered}
              />
            )}
          </Stack>
        </DndProvider>
      </Container>
      <HiddenTaskTable
        project={state.selected}
        closeModal={() => setTableState(null)}
        showTaskModal={tableState}
      />
    </>
  )
}

type State =
  | {status: "loadingProjects"}
  | {status: "loadingTasks"; projects: Project[]; selected: Project[]}
  | {
      status: "ready"
      projects: Project[]
      tasks: AnnotatedTask[]
      selected: Project[]
    }
  | {status: "error"; message: string}

type Action =
  | {type: "setProjects"; projects: Project[]; selected: Project[]}
  | {type: "setTasks"; tasks: AnnotatedTask[]}
  | {type: "updateTask"; taskId: string; updates: Partial<AnnotatedTask>}
  | {type: "addTask"; task: AnnotatedTask}
  | {type: "changeProject"; selected: Project[]}
  | {type: "error"; message: string}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setProjects":
      return {
        status: "loadingTasks",
        projects: action.projects,
        selected: action.selected
      }

    case "setTasks":
      if (state.status !== "loadingTasks" && state.status !== "ready") {
        throw new Error("Cannot set tasks when not loading tasks or ready")
      }
      return {
        ...state,
        status: "ready",
        tasks: action.tasks
      }

    case "updateTask":
      if (state.status !== "ready") {
        throw new Error("Cannot update task when not ready")
      }
      return {
        ...state,
        status: "ready",
        tasks: state.tasks.map((task) =>
          task._id === action.taskId ? {...task, ...action.updates} : task
        )
      }

    case "addTask":
      if (state.status !== "ready") {
        throw new Error("Cannot add task when not ready")
      }
      return {
        ...state,
        status: "ready",
        tasks: [...state.tasks, action.task]
      }

    case "changeProject":
      if (!("projects" in state)) {
        throw new Error("Cannot change project when loading projects")
      }
      return {
        ...state,
        status: "loadingTasks",
        selected: action.selected
      }

    case "error":
      return {status: "error", message: action.message}
  }
}
