import {Add, Pause, PlayArrow} from "@mui/icons-material"
import {IconButton} from "@mui/material"
import React, {FC, useContext} from "react"
import {TimerContext} from "utils/context"
import {AnnotatedTask} from "utils/useAnnotatedTasks"

export const TaskPlayActionButton: FC<{
  annotatedTask: AnnotatedTask
}> = ({annotatedTask}) => {
  const {newTimer, timers, toggleTimer} = useContext(TimerContext)

  const [timerKey] = Object.entries(timers).find(
    ([_key, timer]) => timer.task === annotatedTask._id
  ) ?? [undefined]

  const isPlaying = !!timerKey && !!timers[timerKey].lastStarted

  if (!timerKey) {
    return (
      <IconButton
        onClick={() =>
          newTimer({
            project: annotatedTask.project,
            task: annotatedTask._id
          })
        }
        sx={{color: "text.disabled"}}
      >
        <Add />
      </IconButton>
    )
  }

  if (isPlaying) {
    return (
      <IconButton onClick={() => toggleTimer(timerKey)}>
        <Pause color="success" />
      </IconButton>
    )
  }

  return (
    <IconButton onClick={() => toggleTimer(timerKey)}>
      <PlayArrow />
    </IconButton>
  )
}
