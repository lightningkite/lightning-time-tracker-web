import {Star} from "@mui/icons-material"
import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography
} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useContext} from "react"
import {useDrag} from "react-dnd"
import {AuthContext} from "utils/context"

dayjs.extend(duration)

export interface TaskCardProps {
  task: AnnotatedTask
  onClick: (task: AnnotatedTask) => void
}

export const TaskCard: FC<TaskCardProps> = (props) => {
  const {task, onClick} = props
  const {currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [{opacity}, drag] = useDrag(
    () => ({
      type: task.state,
      item: task,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0 : 1
      })
    }),
    [task]
  )

  const hoursSpent = dayjs
    .duration(task._annotations.totalTaskHours, "hours")
    .asHours()
    .toFixed(1)

  const hoursEstimated = !!task.estimate
    ? dayjs.duration(task.estimate, "hours").asHours().toFixed(1)
    : null

  const isEmergency = task.emergency
  const isCurrentUser = task.user === currentUser._id

  return (
    <Card
      key={task._id}
      ref={permissions.canManageAllTasks ? drag : undefined}
      sx={{
        opacity,
        ...(isEmergency && {
          borderColor: "error.dark",
          borderWidth: 4,
          borderLeftStyle: "solid"
        })
      }}
    >
      <CardActionArea onClick={() => onClick(task)} disableRipple>
        <CardContent sx={{p: 1}}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {isCurrentUser ? (
                <span>
                  <Star
                    color={isEmergency ? "error" : "primary"}
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
}
