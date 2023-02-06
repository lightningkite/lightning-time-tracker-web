import {ListItem, Stack, Typography} from "@mui/material"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import React, {FC} from "react"
import {useNavigate} from "react-router-dom"
import {UserChip} from "./UserChip"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export interface TaskListItemProps {
  task: Task
  setTask: (task: Task) => void
  users: User[]
}

export const TaskListItem: FC<TaskListItemProps> = ({task, setTask, users}) => {
  const navigate = useNavigate()

  return (
    <ListItem
      key={task._id}
      disablePadding
      sx={{
        py: 2,
        "&:not(:last-child)": {
          borderBottom: "1px solid #444"
        }
      }}
    >
      <Stack sx={{width: "100%"}}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{mb: 1}}
        >
          <UserChip users={users} task={task} setTask={setTask} />
          <Typography
            variant="body2"
            color="primary.light"
            fontWeight="bold"
            sx={{opacity: 0.6}}
          >
            {task.state.toUpperCase()}
          </Typography>
        </Stack>

        <Typography
          variant="body1"
          sx={{
            // whiteSpace: "nowrap",
            // overflow: "hidden",
            // textOverflow: "ellipsis",
            mr: 2,
            cursor: "pointer",
            "&:hover": {
              color: "primary.light"
            },
            "&:active": {
              color: "primary.main"
            }
          }}
          onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
        >
          {task.description}
        </Typography>
      </Stack>
    </ListItem>
  )
}
