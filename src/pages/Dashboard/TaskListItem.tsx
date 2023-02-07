import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {MoreTime} from "@mui/icons-material"
import {Box, IconButton, ListItem, Stack, Typography} from "@mui/material"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext} from "react"
import {useNavigate} from "react-router-dom"
import {TimerContext} from "utils/context"
import {UserChip} from "./UserChip"

dayjs.extend(duration)

export interface TaskListItemProps {
  task: Task
  setTask: (task: Task) => void
  users: User[]
}

export const TaskListItem: FC<TaskListItemProps> = ({task, setTask, users}) => {
  const navigate = useNavigate()
  const {newTimer} = useContext(TimerContext)

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

          <Typography variant="body2" sx={{opacity: 0.6, ml: "auto", mr: 1}}>
            {task.state.toUpperCase()}
          </Typography>

          <HoverHelp description="New timer">
            <IconButton
              onClick={() => newTimer({project: task.project, task: task._id})}
            >
              <MoreTime />
            </IconButton>
          </HoverHelp>
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
