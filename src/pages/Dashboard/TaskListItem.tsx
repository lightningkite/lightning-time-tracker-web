import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {MoreTime, Person} from "@mui/icons-material"
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material"
import {Task, User} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext, TimerContext} from "utils/context"

dayjs.extend(duration)

export interface TaskListItemProps {
  task: Task
  users: User[]
}

export const TaskListItem: FC<TaskListItemProps> = ({task, users}) => {
  const navigate = useNavigate()
  const {currentUser} = useContext(AuthContext)
  const {newTimer} = useContext(TimerContext)

  const user = users.find((u) => u._id === task.user)
  const isMine = currentUser._id === task.user

  return (
    <ListItem
      key={task._id}
      disablePadding
      secondaryAction={
        <HoverHelp description="New timer">
          <IconButton
            onClick={() => newTimer({project: task.project, task: task._id})}
          >
            <MoreTime />
          </IconButton>
        </HoverHelp>
      }
      sx={{
        "&:not(:last-child)": {
          borderBottom: "1px solid #444"
        }
      }}
    >
      <ListItemButton
        onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
        sx={{py: 2}}
      >
        {isMine && (
          <HoverHelp description="Assigned to me">
            <ListItemIcon sx={{color: "primary.main"}}>
              <Person />
            </ListItemIcon>
          </HoverHelp>
        )}
        <ListItemText sx={{width: "100%"}} inset={!isMine}>
          <Typography variant="body2" color="text.secondary">
            {task.state.toUpperCase()} &nbsp;&#x2022;&nbsp;{" "}
            {user?.email ?? "Unknown user"}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mr: 2
            }}
          >
            {task.summary}
          </Typography>
          <Typography sx={{mt: 1}}>
            {task.estimate ? `${task.estimate} hr.` : "No estimate"}
          </Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  )
}
