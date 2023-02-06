import {
  RestAutocompleteInput,
  useThrottle
} from "@lightningkite/mui-lightning-components"
import {DeleteOutline, Pause, PlayArrow} from "@mui/icons-material"
import {
  Alert,
  Button,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  TextField,
  useTheme
} from "@mui/material"
import {Project, Task} from "api/sdk"
import {AutoLoadingButton} from "components/AutoLoadingButton"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import HmsInputGroup from "./hmsInputGroup"

export const TimerItem: FC<{timerKey: string}> = ({timerKey}) => {
  const {session} = useContext(AuthContext)
  const {timers, removeTimer, submitTimer, updateTimer, toggleTimer} =
    useContext(TimerContext)
  const theme = useTheme()

  const timer = timers[timerKey]

  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [summary, setSummary] = useState(timer.summary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const throttledSummary = useThrottle(summary, 1000)

  useEffect(() => {
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
    <Paper component={Stack} spacing={2} sx={{p: 1}}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <HmsInputGroup timerKey={timerKey} />
        <Button
          variant={timer.lastStarted ? "contained" : "outlined"}
          // fullWidth
          onClick={() => toggleTimer(timerKey)}
          sx={{height: 56, px: 3}}
        >
          {timer.lastStarted ? <Pause /> : <PlayArrow />}
        </Button>
      </Stack>
      <RestAutocompleteInput
        label="Project"
        restEndpoint={session.project}
        value={project}
        onChange={setProject}
        getOptionLabel={(project) => project.name}
        searchProperties={["name"]}
      />
      <RestAutocompleteInput
        label="Task"
        restEndpoint={session.task}
        value={task}
        onChange={setTask}
        getOptionLabel={(task) => task.description}
        searchProperties={["description"]}
        additionalQueryConditions={[{project: {Equal: project?._id ?? ""}}]}
        dependencies={[project?._id]}
        disabled={!project}
      />
      <TextField
        label="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        multiline
      />
      <Stack direction="row" spacing={1}>
        <AutoLoadingButton
          onClick={() => submitTimer(timerKey)}
          variant="contained"
          disabled={!project || !task || !summary}
          fullWidth
        >
          Submit
        </AutoLoadingButton>
        <IconButton
          onClick={() => removeTimer(timerKey)}
          sx={{
            "&:hover": {
              color: theme.palette.error.main
            }
          }}
        >
          <DeleteOutline />
        </IconButton>
      </Stack>
    </Paper>
  )
}
