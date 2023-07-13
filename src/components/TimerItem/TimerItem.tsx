import {HoverHelp, useThrottle} from "@lightningkite/mui-lightning-components"
import {DeleteOutline, Pause, PlayArrow, UnfoldLess} from "@mui/icons-material"
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  useTheme
} from "@mui/material"
import type {Project, Task, Timer} from "api/sdk";
import { TaskState} from "api/sdk"
import {AutoLoadingButton} from "components/AutoLoadingButton"
import type {
  FC} from "react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {ContentCollapsed} from "./ContentCollapsed"
import HmsInputGroup from "./hmsInputGroup"

export interface TimerItemProps {
  timer: Timer
  projectOptions: Project[] | undefined
}

export const TimerItem: FC<TimerItemProps> = ({timer, projectOptions}) => {
  const {session, currentUser} = useContext(AuthContext)
  const {removeTimer, submitTimer, updateTimer, toggleTimer} =
    useContext(TimerContext)
  const theme = useTheme()

  const [summary, setSummary] = useState(timer.summary)
  const [expanded, setExpanded] = useState(!timer.project || !timer.task)
  const [sortedTaskOptions, setSortedTaskOptions] = useState<Task[]>()
  const [isCreatingNewTask, setIsCreatingNewTask] = useState(false)

  const throttledSummary = useThrottle(summary, 1000)

  const sortedProjects = useMemo(() => {
    return projectOptions?.sort((p) =>
      currentUser.projectFavorites.includes(p._id) ? -1 : 1
    )
  }, [projectOptions])

  const project = useMemo(
    () => projectOptions?.find((p) => p._id === timer.project),
    [timer.project, projectOptions]
  )

  const task = useMemo(
    () => sortedTaskOptions?.find((t) => t._id === timer.task),
    [timer.task, sortedTaskOptions]
  )

  useEffect(() => {
    if (!timer.project) {
      setSortedTaskOptions([])
      return
    }

    setSortedTaskOptions(undefined)

    session.task
      .query({
        limit: 1000,
        condition: {
          And: [
            {project: {Equal: timer.project}},
            {state: {NotInside: [TaskState.Delivered, TaskState.Cancelled]}}
          ]
        }
      })
      .then((tasks) =>
        setSortedTaskOptions(
          tasks.sort((a, b) =>
            isMyActiveTask(a) ? -1 : isMyActiveTask(b) ? 1 : 0
          )
        )
      )
  }, [timer.project])

  useEffect(() => {
    updateTimer(timer._id, {summary: throttledSummary})
  }, [throttledSummary])

  useEffect(() => {
    if (!task || !project) return

    setExpanded(false)

    if (task.project !== project._id) updateTimer(timer._id, {task: undefined})
  }, [timer.task, timer.project])

  const isMyActiveTask = useCallback((task: Task): boolean => {
    return task.user === currentUser._id && task.state === TaskState.Active
  }, [])

  const createTask = useCallback(
    (summary: string) => {
      if (!project) return

      setIsCreatingNewTask(true)

      session.task
        .insert({
          _id: crypto.randomUUID(),
          project: project._id,
          projectName: project.name,
          organization: project.organization,
          organizationName: undefined,
          user: currentUser._id,
          userName: currentUser.name,
          state: TaskState.Active,
          summary,
          description: "",
          attachments: [],
          estimate: undefined,
          emergency: false,
          createdAt: new Date().toISOString(),
          createdBy: currentUser._id,
          creatorName: currentUser.name,
          pullRequestLink: null
        })
        .then((task) => {
          setSortedTaskOptions((tasks) =>
            tasks ? [task, ...tasks] : undefined
          )
          updateTimer(timer._id, {task: task._id})
        })
        .catch(console.error)
        .finally(() => setIsCreatingNewTask(false))
    },
    [project]
  )

  return (
    <Paper sx={{p: 1}}>
      {expanded ? (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center">
            <HmsInputGroup timer={timer} />

            {timer.project && (
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
                  removeTimer(timer._id)
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
            options={sortedProjects ?? []}
            disabled={!sortedProjects}
            loading={!sortedProjects}
            value={project ?? null}
            onChange={(e, value) => {
              updateTimer(timer._id, {project: value?._id, task: null})
            }}
            getOptionLabel={(project) => project.name}
            renderInput={(params) => <TextField {...params} label="Project" />}
            groupBy={(project) =>
              currentUser.projectFavorites.includes(project._id)
                ? "Favorites"
                : "All"
            }
          />

          <Autocomplete<Task | string, false, false, true>
            options={sortedTaskOptions ?? []}
            disabled={!sortedTaskOptions || !timer.project || isCreatingNewTask}
            loading={!sortedTaskOptions || isCreatingNewTask}
            value={task ?? null}
            onChange={(e, value) =>
              typeof value === "string"
                ? createTask(value)
                : updateTimer(timer._id, {task: value?._id})
            }
            getOptionLabel={(task) =>
              typeof task === "string" ? `Create task "${task}"` : task.summary
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={isCreatingNewTask ? "Creating new task..." : "Task"}
                placeholder={isCreatingNewTask ? "Creating task..." : undefined}
              />
            )}
            groupBy={(task) => {
              return typeof task === "string"
                ? "New Task"
                : isMyActiveTask(task)
                ? "My Active Tasks"
                : "All Open"
            }}
            filterOptions={(options, {inputValue, getOptionLabel}) => {
              const filtered = options.filter((option) =>
                getOptionLabel(option)
                  .toLowerCase()
                  .includes(inputValue.toLowerCase())
              )

              const isExistingTask = filtered.some(
                (option) => getOptionLabel(option) === inputValue
              )

              if (inputValue !== "" && !isExistingTask) {
                filtered.push(inputValue)
              }

              return filtered
            }}
            freeSolo
            clearOnBlur
            selectOnFocus
          />
        </Stack>
      ) : (
        <Box sx={{cursor: "pointer"}} onClick={() => setExpanded(true)}>
          <ContentCollapsed
            task={task ?? null}
            project={project ?? null}
            timer={timer}
          />
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
          onClick={() => toggleTimer(timer._id)}
          fullWidth
          sx={{maxWidth: 100}}
        >
          {timer.lastStarted ? <Pause /> : <PlayArrow />}
        </Button>
        <AutoLoadingButton
          onClick={() =>
            submitTimer(timer._id).catch((e) => alert("Error submitting timer"))
          }
          variant="contained"
          disabled={!timer.project || !summary}
          fullWidth
          sx={{maxWidth: 100}}
        >
          Submit
        </AutoLoadingButton>
      </Stack>
    </Paper>
  )
}
