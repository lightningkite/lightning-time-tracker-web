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
    .duration(task.annotations.totalTaskHours, "hours")
    .asHours()
    .toFixed(1)

  const hoursEstimated = !!task.estimate
    ? dayjs.duration(task.estimate, "hours").asHours().toFixed(1)
    : null

  const canDrag =
    (currentUser._id === task.user && permissions.tasks) ||
    permissions.manageTasks

  return (
    <Card key={task._id} ref={canDrag ? drag : undefined} style={{opacity}}>
      <CardActionArea onClick={() => onClick(task)} disableRipple>
        <CardContent sx={{p: 1}}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              {task.user === currentUser._id ? (
                <span>
                  <Star color="primary" fontSize="inherit" sx={{mr: 1}} />
                  {task.userName}
                </span>
              ) : (
                task.userName
              )}
            </Typography>
            {permissions.timeEntries && (
              <Typography variant="body2" color="text.secondary">
                {hoursEstimated
                  ? `${hoursSpent} / ${hoursEstimated} hr`
                  : `${hoursSpent} hr`}
              </Typography>
            )}
          </Stack>
          <Typography>{task.summary}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
