import {Box, Skeleton, Stack, Typography} from "@mui/material"
import {TaskState} from "api/sdk"
import {TaskModal} from "components/TaskModal"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useState} from "react"
import {useDrop} from "react-dnd"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"
import {TaskCard} from "./TaskCard"

dayjs.extend(duration)

export interface TaskStateColumnProps {
  state: TaskState
  tasks: AnnotatedTask[] | undefined
  handleDrop: (task: AnnotatedTask, newState: TaskState) => void
}

export const TaskStateColumn: FC<TaskStateColumnProps> = (props) => {
  const {state, tasks, handleDrop} = props

  const [selectedTask, setSelectedTask] = useState<AnnotatedTask | null>(null)

  const [{isOver, canDrop}, drop] = useDrop({
    accept: Object.values(TaskState).filter((s) => s !== state),
    drop: (task) => handleDrop(task as AnnotatedTask, state),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  return (
    <>
      <Box
        sx={{
          minWidth: 300,
          flexGrow: 1,
          flexBasis: 0,
          pb: 3,
          bgcolor: isOver && canDrop ? "primary.dark" : "transparent",
          borderRadius: 1,
          p: 1
        }}
        ref={drop}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{mb: 2}}
        >
          <Typography variant="h3">{state}</Typography>
          {tasks && (
            <Typography variant="h3" color="text.secondary">
              {tasks.length}
            </Typography>
          )}
        </Stack>

        {(() => {
          if (tasks === undefined)
            return (
              <Stack spacing={1}>
                {Array.from({length: 3}).map((_, i) => (
                  <Skeleton key={i} height={60} variant="rounded" />
                ))}
              </Stack>
            )

          if (tasks.length === 0)
            return (
              <Typography color="text.disabled" fontStyle="italic">
                No tasks
              </Typography>
            )

          return (
            <Stack
              spacing={1.5}
              sx={{
                opacity: isOver && canDrop ? 0.5 : 1
              }}
            >
              {tasks
                .filter((t) => t.state === state)
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
            </Stack>
          )
        })()}
      </Box>

      <TaskModal
        task={selectedTask}
        handleClose={() => setSelectedTask(null)}
        getEditRoute={(task) => `/projects/${task.project}/tasks/${task._id}`}
      />
    </>
  )
}
