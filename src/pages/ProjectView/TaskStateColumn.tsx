import {Box, Paper, Stack, Typography} from "@mui/material"
import {Task, TaskState} from "api/sdk"
import React, {FC} from "react"

export interface TaskStateColumnProps {
  state: TaskState
  tasks: Task[]
}

export const TaskStateColumn: FC<TaskStateColumnProps> = (props) => {
  const {state, tasks} = props

  return (
    <Box sx={{minWidth: 300, pb: 3}}>
      <Typography variant="h3">{state}</Typography>
      <Stack spacing={1} sx={{mt: 2}}>
        {tasks
          .filter((t) => t.state === state)
          .map((task) => (
            <Paper sx={{p: 1}} key={task._id}>
              <Typography variant="body2" color="text.secondary">
                {task.userName}
              </Typography>
              <Typography>{task.summary}</Typography>
            </Paper>
          ))}
      </Stack>
    </Box>
  )
}
