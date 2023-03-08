import {CheckCircle} from "@mui/icons-material"
import {Box, Typography} from "@mui/material"
import {TaskState} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC} from "react"
import {useDrop} from "react-dnd"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"

dayjs.extend(duration)

export interface DeliveredColumnProps {
  handleDrop: (task: AnnotatedTask, newState: TaskState) => void
}

export const DeliveredColumn: FC<DeliveredColumnProps> = (props) => {
  const {handleDrop} = props

  const [{isOver, canDrop}, drop] = useDrop({
    accept: Object.values(TaskState),
    drop: (task) => handleDrop(task as AnnotatedTask, TaskState.Delivered),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

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
      <CheckCircle
        sx={{
          color: canDrop ? "white" : "text.disabled"
        }}
      />
      {canDrop && (
        <Typography
          sx={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            mt: 2,
            color: "text.secondary"
          }}
        >
          Delivered
        </Typography>
      )}
    </Box>
  )
}
