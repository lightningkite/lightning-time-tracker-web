import {HoverHelp, useThrottle} from "@lightningkite/mui-lightning-components"
import {DeleteOutline, Pause, PlayArrow, UnfoldLess} from "@mui/icons-material"
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  useTheme
} from "@mui/material"
import {Project, Task, TaskState} from "api/sdk"
import {AutoLoadingButton} from "components/AutoLoadingButton"
import React, {FC, useContext, useEffect, useMemo, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {ContentCollapsed} from "./ContentCollapsed"
import HmsInputGroup from "./hmsInputGroup"

export interface TimerItemProps {
  timerKey: string
  projectOptions: Project[] | undefined
}

export const TimerItem: FC<TimerItemProps> = ({timerKey, projectOptions}) => {
  const {session, currentUser} = useContext(AuthContext)
  const {timers, removeTimer, submitTimer, updateTimer, toggleTimer} =
    useContext(TimerContext)
  const theme = useTheme()

  const timer = timers[timerKey]

  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [summary, setSummary] = useState(timer.summary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expanded, setExpanded] = useState(!timer.project || !timer.task)
  const [taskOptions, setTaskOptions] = useState<Task[]>()

  const throttledSummary = useThrottle(summary, 1000)

  const sortedProjectOptions = useMemo(
    () =>
      projectOptions?.sort((p) =>
        currentUser.projectFavorites.includes(p._id) ? -1 : 1
      ),
    [projectOptions]
  )

  useEffect(() => {
    if (!project) {
      setTaskOptions([])
      return
    }

    setTaskOptions(undefined)

    session.task
      .query({
        limit: 1000,
        condition: {
          And: [
            {project: {Equal: project._id}},
            {state: {NotInside: [TaskState.Delivered, TaskState.Cancelled]}}
          ]
        }
      })
      .then((tasks) =>
        setTaskOptions(
          tasks.sort((a, b) =>
            isMyActiveTask(a) ? -1 : isMyActiveTask(b) ? 1 : 0
          )
        )
      )
  }, [project])

  useEffect(() => {
    expanded && task && project && setExpanded(false)

    updateTimer(timerKey, {
      project: project?._id,
      task: task?._id,
      summary: throttledSummary
    })
  }, [task, project, throttledSummary])

  useEffect(() => {
    Promise.all([
      !!timer.project && session.project.detail(timer.project),
      !!timer.task && session.task.detail(timer.task)
    ])
      .then(([project, task]) => {
        project && setProject(project)
        task && setTask(task)
      })
      .catch(() => setError("Project or task not found"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (task?.project !== project?._id) {
      setTask(null)
    }
  }, [project])

  function isMyActiveTask(task: Task): boolean {
    return task.user === currentUser._id && task.state === TaskState.Active
  }

  if (loading) return <Skeleton variant="rounded" height={60} />

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" onClick={() => removeTimer(timerKey)}>
            <DeleteOutline />
          </IconButton>
        }
      >
        {error}
      </Alert>
    )
  }

  return (
    <Paper sx={{p: 1}}>
      {expanded ? (
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            // justifyContent="space-between"
          >
            <HmsInputGroup timerKey={timerKey} />

            {project && (
              <HoverHelp description="Collapse">
                <IconButton onClick={() => setExpanded(false)}>
                  <UnfoldLess />
                </IconButton>
              </HoverHelp>
            )}

            <HoverHelp description="Delete timer">
              <IconButton
                onClick={() =>
                  confirm("Are you sure you want to delete this timer?") &&
                  removeTimer(timerKey)
                }
                sx={{
                  "&:hover": {
                    color: theme.palette.error.main
                  }
                }}
              >
                <DeleteOutline />
              </IconButton>
            </HoverHelp>
          </Stack>

          <Autocomplete
            options={sortedProjectOptions ?? []}
            disabled={!sortedProjectOptions}
            loading={!sortedProjectOptions}
            value={project}
            onChange={(e, value) => setProject(value)}
            getOptionLabel={(project) => project.name}
            renderInput={(params) => <TextField {...params} label="Project" />}
            groupBy={(project) =>
              currentUser.projectFavorites.includes(project._id)
                ? "Favorites"
                : "All"
            }
          />

          <Autocomplete
            options={taskOptions ?? []}
            disabled={!taskOptions || !project}
            loading={!taskOptions}
            value={task}
            onChange={(e, value) => setTask(value)}
            getOptionLabel={(task) => task.summary}
            renderInput={(params) => <TextField {...params} label="Task" />}
            groupBy={(task) =>
              isMyActiveTask(task) ? "My Active Tasks" : "All Open"
            }
          />
        </Stack>
      ) : (
        <Box sx={{cursor: "pointer"}} onClick={() => setExpanded(true)}>
          <ContentCollapsed task={task} project={project} timer={timer} />
        </Box>
      )}
      <TextField
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        multiline
        sx={{my: 2}}
        fullWidth
      />
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Button
          variant={timer.lastStarted ? "contained" : "outlined"}
          onClick={() => toggleTimer(timerKey)}
          fullWidth
          sx={{maxWidth: 100}}
        >
          {timer.lastStarted ? <Pause /> : <PlayArrow />}
        </Button>
        <AutoLoadingButton
          onClick={() =>
            submitTimer(timerKey).catch((e) => alert("Error submitting timer"))
          }
          variant="contained"
          disabled={!project || !summary}
          fullWidth
          sx={{maxWidth: 100}}
        >
          Submit
        </AutoLoadingButton>
      </Stack>
    </Paper>
  )
}
