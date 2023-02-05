import {Delete, DeleteOutline} from "@mui/icons-material"
import {Alert, Box, Button, IconButton, Skeleton} from "@mui/material"
import {Project, Task} from "api/sdk"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"

export const TimerItem: FC<{timerKey: string}> = ({timerKey}) => {
  const {session} = useContext(AuthContext)
  const {timers, removeTimer} = useContext(TimerContext)

  const timer = timers[timerKey]

  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
    <Box>
      <p>
        {timer.accumulatedSeconds} - {timer.lastStarted?.toISOString()}
      </p>
    </Box>
  )
}
