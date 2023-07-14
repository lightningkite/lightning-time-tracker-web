import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography
} from "@mui/material"
import {TaskState} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext} from "react"
import {useDrag} from "react-dnd"
import {AuthContext} from "utils/context"
import {getContrastingColor, getNameInitials} from "utils/helpers"

dayjs.extend(duration)

export interface TaskCardProps {
  task: AnnotatedTask
  onClick: (task: AnnotatedTask) => void
}

export const TaskCard: FC<TaskCardProps> = (props) => {
  const {task, onClick} = props
  const {userColors, currentUser} = useContext(AuthContext)
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

  return (
    <Card
      key={task._id}
      ref={
        permissions.canManageAllTasks ||
        (task.user === currentUser._id && permissions.canBeAssignedTasks) ||
        (task.state === TaskState.Approved && permissions.canDeliverTasks)
          ? drag
          : undefined
      }
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
          <Stack direction="row" gap={1} alignItems="center">
            {task.user ? (
              <>
                <Avatar
                  // src="https://avatars.githubusercontent.com/u/8319056?v=4"
                  sx={{
                    backgroundColor: userColors[task.user],
                    width: "1.6rem",
                    height: "1.6rem",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    border: `1px solid ${userColors[task.user]}`,
                    color: getContrastingColor(
                      userColors[task.user] ?? "#444444"
                    )
                  }}
                >
                  {getNameInitials(task.userName ?? "")}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {task.userName}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Unassigned
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" ml="auto">
              {hoursEstimated
                ? `${hoursSpent} / ${hoursEstimated} hr`
                : `${hoursSpent} hr`}
            </Typography>
          </Stack>

          <Typography mt={0.5}>{task.summary}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
