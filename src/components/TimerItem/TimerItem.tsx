import {
  HoverHelp,
  RestAutocompleteInput,
  useThrottle
} from "@lightningkite/mui-lightning-components"
import {DeleteOutline, Pause, PlayArrow, UnfoldLess} from "@mui/icons-material"
import {
  Alert,
  Box,
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
import {ContentCollapsed} from "./ContentCollapsed"
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
  const [expanded, setExpanded] = useState(!timer.project || !timer.task)

  const throttledSummary = useThrottle(summary, 1000)

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
            getOptionLabel={(task) => task.summary}
            searchProperties={["summary"]}
            additionalQueryConditions={[
              project ? {project: {Equal: project._id}} : {Never: true}
            ]}
            dependencies={[project?._id]}
            disabled={!project}
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
      <Stack direction="row" spacing={1}>
        <AutoLoadingButton
          onClick={() =>
            submitTimer(timerKey).catch((e) => alert("Error submitting timer"))
          }
          variant="contained"
          disabled={!project || !summary}
          fullWidth
        >
          Submit
        </AutoLoadingButton>
        <Button
          variant={timer.lastStarted ? "contained" : "outlined"}
          onClick={() => toggleTimer(timerKey)}
        >
          {timer.lastStarted ? <Pause /> : <PlayArrow />}
        </Button>
      </Stack>
    </Paper>
  )
}
