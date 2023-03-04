import {Box, Paper, Stack, Typography} from "@mui/material"
import {TaskState} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC} from "react"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"

dayjs.extend(duration)

export interface TaskStateColumnProps {
  state: TaskState
  tasks: AnnotatedTask[]
}

export const TaskStateColumn: FC<TaskStateColumnProps> = (props) => {
  const {state, tasks} = props

  return (
    <Box sx={{minWidth: 300, pb: 3}}>
      <Typography variant="h3" sx={{mb: 2}}>
        {state}
      </Typography>
      {tasks.length === 0 && (
        <Typography color="text.disabled" fontStyle="italic">
          No tasks
        </Typography>
      )}
      <Stack spacing={1}>
        {tasks
          .filter((t) => t.state === state)
          .map((task) => {
            const hoursSpent = dayjs
              .duration(task.annotations.totalTaskHours, "hours")
              .asHours()
              .toFixed(1)
            const hoursEstimated = !!task.estimate
              ? dayjs.duration(task.estimate, "hours").asHours().toFixed(1)
              : null

            return (
              <Paper sx={{p: 1}} key={task._id}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    {task.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hoursEstimated
                      ? `${hoursSpent} / ${hoursEstimated} hr`
                      : `${hoursSpent} hr`}
                  </Typography>
                </Stack>
                <Typography>{task.summary}</Typography>
              </Paper>
            )
          })}
      </Stack>
    </Box>
  )
}
