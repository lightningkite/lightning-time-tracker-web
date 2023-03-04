import {
  Autocomplete,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField
} from "@mui/material"
import {Project, Task, TaskState} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useMemo, useReducer} from "react"
import {AuthContext} from "utils/context"
import {dynamicFormatDate} from "utils/helpers"
import {TaskStateColumn} from "./TaskStateColumn"

export const ProjectIndex: FC = () => {
  const {session} = useContext(AuthContext)

  const [state, dispatch] = useReducer(reducer, {status: "loadingProjects"})

  useEffect(() => {
    session.project
      .query({orderBy: ["name"]})
      .then((projects) => dispatch({type: "setProjects", projects}))
      .catch(() => dispatch({type: "error"}))
  }, [])

  useEffect(() => {
    if (!("selected" in state)) return

    session.task
      .query({
        condition: {project: {Equal: state.selected._id}}
      })
      .then((tasks) => dispatch({type: "setTasks", tasks}))
  }, ["selected" in state && state.selected._id])

  const tasksByState: Record<TaskState, Task[]> = useMemo(() => {
    const map: Record<TaskState, Task[]> = {
      [TaskState.Active]: [],
      [TaskState.Approved]: [],
      [TaskState.Cancelled]: [],
      [TaskState.Delivered]: [],
      [TaskState.Hold]: [],
      [TaskState.Testing]: []
    }

    if ("tasks" in state) {
      for (const task of state.tasks) {
        map[task.state].push(task)
      }
    }

    return map
  }, ["tasks" in state && state.tasks])

  if (state.status === "loadingProjects") return <Loading />
  if (state.status === "error") return <ErrorAlert>Error occurred</ErrorAlert>

  return (
    <Container maxWidth="lg">
      <PageHeader title="Project View">
        <Autocomplete
          disableClearable
          options={state.projects}
          onChange={(_, newValue) =>
            dispatch({type: "changeProject", selected: newValue})
          }
          value={state.selected}
          sx={{width: 300}}
          renderInput={(params) => <TextField {...params} label="Project" />}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option._id === value._id}
        />
      </PageHeader>

      <Stack
        direction="row"
        spacing={2}
        sx={{overflowX: "auto"}}
        divider={<Divider orientation="vertical" flexItem />}
      >
        {Object.values(TaskState).map((taskState) => (
          <TaskStateColumn
            key={taskState}
            state={taskState}
            tasks={tasksByState[taskState]}
          />
        ))}
      </Stack>
    </Container>
  )
}

type State =
  | {status: "loadingProjects"}
  | {status: "loadingTasks"; projects: Project[]; selected: Project}
  | {status: "ready"; projects: Project[]; tasks: Task[]; selected: Project}
  | {status: "error"}

type Action =
  | {type: "loadingProjects"}
  | {type: "setProjects"; projects: Project[]}
  | {type: "setTasks"; tasks: Task[]}
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
        selected: action.projects[0]
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
