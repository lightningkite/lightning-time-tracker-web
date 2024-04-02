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

export const TaskCard: FC<{
  task: AnnotatedTask
  onClick: (task: AnnotatedTask) => void
  showProject: boolean
}> = ({task, onClick, showProject}) => {
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
        task.users.map(
          (u) => u === currentUser._id && permissions.canBeAssignedTasks
        ) ||
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
            {task.users.length > 0 ? (
              <>
                <Avatar
                  // src="https://avatars.githubusercontent.com/u/8319056?v=4"
                  sx={{
                    backgroundColor: userColors[task.users[0]],
                    width: "1.6rem",
                    height: "1.6rem",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    border: `1px solid ${userColors[task.users[0]]}`,
                    color: getContrastingColor(
                      userColors[task.users[0]] ?? "#444444"
                    )
                  }}
                >
                  {getNameInitials(task.userNames[0] ?? "")}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {`${task.userNames[0]}${
                    task.userNames.length === 2 ? `, ${task.userNames[1]}` : ""
                  }`}
                  {task.userNames.length > 2
                    ? ` + ${task.userNames.length - 1}`
                    : ""}
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

          {showProject && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {task.projectName}
            </Typography>
          )}

          <Typography mt={0.5}>{task.summary}</Typography>
          <Typography variant="body2" color="text.secondary" ml="auto">
            {task.tags.join(", ")}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
