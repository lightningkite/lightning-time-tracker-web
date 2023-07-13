import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Add, Pause, PlayArrow} from "@mui/icons-material"
import {IconButton} from "@mui/material"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import type {FC} from "react"
import React, {useContext} from "react"
import {TimerContext} from "utils/context"

export const TaskPlayActionButton: FC<{
  annotatedTask: AnnotatedTask
}> = ({annotatedTask}) => {
  const {newTimer, timers, toggleTimer} = useContext(TimerContext)

  const timer = timers?.find((t) => t.task === annotatedTask._id)
  const isPlaying = !!timer?.lastStarted

  if (!timer) {
    return (
      <HoverHelp description="New timer">
        <IconButton
          onClick={() =>
            newTimer({
              project: annotatedTask.project,
              task: annotatedTask._id
            })
          }
          sx={{color: "text.disabled"}}
          disabled={!timers}
        >
          <Add />
        </IconButton>
      </HoverHelp>
    )
  }

  if (isPlaying) {
    return (
      <IconButton onClick={() => toggleTimer(timer._id)} disabled={!timers}>
        <Pause color="success" />
      </IconButton>
    )
  }

  return (
    <IconButton onClick={() => toggleTimer(timer._id)} disabled={!timers}>
      <PlayArrow />
    </IconButton>
  )
}
