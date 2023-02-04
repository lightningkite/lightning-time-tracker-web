import {PauseCircle, PlayCircle} from "@mui/icons-material"
import {
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  Stack,
  Typography
} from "@mui/material"
import {Task} from "api/sdk"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {getTimerSeconds} from "utils/helpers"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export interface TaskListItemProps {
  task: Task
}

export const TaskListItem: FC<TaskListItemProps> = ({task}) => {
  const {session} = useContext(AuthContext)
  const {timers, getTimerForTask, toggleTimer, newTimer} =
    useContext(TimerContext)

  const timerKey = getTimerForTask(task._id)
  const timer = timerKey ? timers[timerKey] : undefined
  const isPlaying = !!timer?.lastStarted
  const isPaused = timer && !isPlaying

  const [runningSeconds, setRunningSeconds] = useState(0)
  const [userName, setUserName] = useState("...")

  const updateRunningSeconds = () => {
    if (!timer) return
    setRunningSeconds(getTimerSeconds(timer))
  }

  useEffect(() => {
    updateRunningSeconds()
    if (!isPlaying) return

    const interval = setInterval(updateRunningSeconds, 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    if (!task.user) return
    session.user.detail(task.user).then((user) => setUserName(user.email))
  }, [task.user])

  const handlePlay = (params: {project: string; task: string}) => {
    const key = getTimerForTask(params.task)
    if (key) {
      toggleTimer(key)
    } else {
      newTimer({project: params.project, task: params.task})
    }
  }

  const handlePause = (key: string) => {
    toggleTimer(key)
  }

  return (
    <ListItem
      key={task._id}
      secondaryAction={
        isPlaying ? (
          <IconButton
            edge="end"
            onClick={() => handlePause(timerKey as string)}
            color="primary"
          >
            <PauseCircle fontSize="large" />
          </IconButton>
        ) : (
          <IconButton
            edge="end"
            onClick={() => handlePlay({project: task.project, task: task._id})}
            sx={{
              color: "text.disabled",
              "&:hover": {color: "text.primary"}
            }}
          >
            <PlayCircle fontSize="large" />
          </IconButton>
        )
      }
      disablePadding
      sx={{
        "&:not(:last-child)": {
          borderBottom: "1px solid #444"
        },
        "& > *:last-child": {
          display: isPlaying || isPaused ? "block" : "none"
        },
        "&:hover": {
          "& > *:last-child": {
            display: "block !important"
          }
        }
      }}
    >
      <ListItemButton sx={{py: 2}}>
        <Stack direction="row" alignItems="center" sx={{width: "100%"}}>
          <Stack sx={{width: "100%", borderRight: "1px solid #333", mr: 2}}>
            <Typography
              variant="body2"
              color="primary.light"
              fontWeight="bold"
              sx={{opacity: 0.6}}
            >
              {task.state.toUpperCase()}
            </Typography>
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{mb: 1, display: "inline"}}
            >
              {userName}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                // whiteSpace: "nowrap",
                // overflow: "hidden",
                // textOverflow: "ellipsis",
                mr: 2
                // color: "text.secondary"
              }}
            >
              {task.description}
            </Typography>
          </Stack>

          <Box sx={{flexBasis: "6rem", mr: 2}}>
            <Typography textAlign="right">
              {timer &&
                dayjs.duration(runningSeconds, "second").format("HH:mm:ss")}
            </Typography>
          </Box>
        </Stack>
      </ListItemButton>
    </ListItem>
  )
}
