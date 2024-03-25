import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Cancel, CheckCircle} from "@mui/icons-material"
import {Box, IconButton, Typography} from "@mui/material"
import {TaskState} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import type {FC} from "react"
import React from "react"
import {useDrop} from "react-dnd"
import {taskStateLabels} from "utils/helpers"

dayjs.extend(duration)

export interface CompactColumnProps {
  handleDrop: (task: AnnotatedTask, newState: TaskState) => void
  taskState: TaskState
  onClick: () => void
}

export const CompactColumn: FC<CompactColumnProps> = (props) => {
  const {handleDrop, taskState, onClick} = props

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
      <IconButton onClick={onClick}>
        <HoverHelp
          description={
            taskState === TaskState.Delivered
              ? "Delivered Tasks"
              : "Cancelled Tasks"
          }
        >
          <Icon sx={{color: canDrop ? "white" : "text.disabled"}} />
        </HoverHelp>
      </IconButton>

      {canDrop && (
        <Typography
          sx={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            mt: 2,
            color: "text.secondary"
          }}
        >
          {taskStateLabels[taskState]}
        </Typography>
      )}
    </Box>
  )
}
