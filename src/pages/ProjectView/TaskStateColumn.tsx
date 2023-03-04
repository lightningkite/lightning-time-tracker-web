import {Star} from "@mui/icons-material"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography
} from "@mui/material"
import {TaskState} from "api/sdk"
import {TaskModal} from "components/TaskModal"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"

dayjs.extend(duration)

export interface TaskStateColumnProps {
  state: TaskState
  tasks: AnnotatedTask[] | undefined
}

export const TaskStateColumn: FC<TaskStateColumnProps> = (props) => {
  const {state, tasks} = props
  const {currentUser} = useContext(AuthContext)

  const [selectedTask, setSelectedTask] = useState<AnnotatedTask | null>(null)

  return (
    <>
      <Box sx={{minWidth: 300, flexGrow: 1, flexBasis: 0, pb: 3}}>
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
            <Stack spacing={1.5}>
              {tasks
                .filter((t) => t.state === state)
                .map((task) => {
                  const hoursSpent = dayjs
                    .duration(task.annotations.totalTaskHours, "hours")
                    .asHours()
                    .toFixed(1)
                  const hoursEstimated = !!task.estimate
                    ? dayjs
                        .duration(task.estimate, "hours")
                        .asHours()
                        .toFixed(1)
                    : null

                  return (
                    <Card key={task._id}>
                      <CardActionArea onClick={() => setSelectedTask(task)}>
                        <CardContent sx={{p: 1}}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              {task.user === currentUser._id ? (
                                <span>
                                  <Star
                                    color="primary"
                                    fontSize="inherit"
                                    sx={{mr: 1}}
                                  />
                                  {task.userName}
                                </span>
                              ) : (
                                task.userName
                              )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {hoursEstimated
                                ? `${hoursSpent} / ${hoursEstimated} hr`
                                : `${hoursSpent} hr`}
                            </Typography>
                          </Stack>
                          <Typography>{task.summary}</Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  )
                })}
            </Stack>
          )
        })()}
      </Box>

      <TaskModal
        task={selectedTask}
        handleClose={() => setSelectedTask(null)}
      />
    </>
  )
}
