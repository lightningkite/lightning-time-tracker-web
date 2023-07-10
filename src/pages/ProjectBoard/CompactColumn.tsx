import {Cancel, CheckCircle} from "@mui/icons-material"
import {Box, Typography} from "@mui/material"
import {TaskState} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import React, {FC} from "react"
import {useDrop} from "react-dnd"

dayjs.extend(duration)

export interface CompactColumnProps {
  handleDrop: (task: AnnotatedTask, newState: TaskState) => void
  taskState: TaskState
}

export const CompactColumn: FC<CompactColumnProps> = (props) => {
  const {handleDrop, taskState} = props

  const [{isOver, canDrop}, drop] = useDrop({
    accept: Object.values(TaskState),
    drop: (task) => handleDrop(task as AnnotatedTask, taskState),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const Icon = taskState === TaskState.Delivered ? CheckCircle : Cancel

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor:
          isOver && canDrop
            ? "primary.dark"
            : canDrop
            ? "action.hover"
            : "transparent"
      }}
      ref={drop}
    >
      <Icon sx={{color: canDrop ? "white" : "text.disabled"}} />

      {canDrop && (
        <Typography
          sx={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            mt: 2,
            color: "text.secondary"
          }}
        >
          {taskState}
        </Typography>
      )}
    </Box>
  )
}
