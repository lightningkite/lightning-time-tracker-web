import {ArrowDropDown} from "@mui/icons-material"
import {Chip, ListItem, Stack, Typography} from "@mui/material"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {getTimerSeconds} from "utils/helpers"

import duration from "dayjs/plugin/duration"
import {UserChip} from "./UserChip"
dayjs.extend(duration)

export interface TaskListItemProps {
  task: Task
  setTask: (task: Task) => void
  users: User[]
}

export const TaskListItem: FC<TaskListItemProps> = ({task, setTask, users}) => {
  const {session, currentUser} = useContext(AuthContext)
  const {timers, getTimerForTask, toggleTimer, newTimer} =
    useContext(TimerContext)

  const timerKey = getTimerForTask(task._id)
  const timer = timerKey ? timers[timerKey] : undefined
  const isPlaying = !!timer?.lastStarted
  const isPaused = timer && !isPlaying
  const isMine = task.user === currentUser._id
  const taskUser = users.find((user) => user._id === task.user)

  const [runningSeconds, setRunningSeconds] = useState(0)

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
      // secondaryAction={
      //   isPlaying ? (
      //     <IconButton
      //       edge="end"
      //       onClick={() => handlePause(timerKey as string)}
      //       color="primary"
      //     >
      //       <PauseCircle fontSize="large" />
      //     </IconButton>
      //   ) : (
      //     <IconButton
      //       edge="end"
      //       onClick={() => handlePlay({project: task.project, task: task._id})}
      //       sx={{
      //         color: "text.disabled",
      //         "&:hover": {color: "text.primary"}
      //       }}
      //     >
      //       <PlayCircle fontSize="large" />
      //     </IconButton>
      //   )
      // }
      disablePadding
      sx={{
        py: 2,
        "&:not(:last-child)": {
          borderBottom: "1px solid #444"
        }
        // "& > *:last-child": {
        //   display: isPlaying || isPaused ? "block" : "none"
        // },
        // "&:hover": {
        //   "& > *:last-child": {
        //     display: "block !important"
        //   }
        // }
      }}
    >
      <Stack sx={{width: "100%"}}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{mb: 1}}
        >
          <UserChip users={users} task={task} setTask={setTask} />
          <Typography
            variant="body2"
            color="primary.light"
            fontWeight="bold"
            sx={{opacity: 0.6}}
          >
            {task.state.toUpperCase()}
          </Typography>
        </Stack>

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

      {/* <Box sx={{flexBasis: "6rem", mr: 2}}>
          <Typography textAlign="right">
            {timer &&
              dayjs.duration(runningSeconds, "second").format("HH:mm:ss")}
          </Typography>
        </Box> */}
    </ListItem>
  )
}
