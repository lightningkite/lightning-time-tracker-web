import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {MoreTime, Person} from "@mui/icons-material"
import {
  IconButton,
  LinearProgress,
  LinearProgressProps,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext, TimerContext} from "utils/context"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"

dayjs.extend(duration)

export interface TaskListItemProps {
  annotatedTask: AnnotatedTask
}

export const TaskListItem: FC<TaskListItemProps> = ({annotatedTask}) => {
  const navigate = useNavigate()
  const {currentUser} = useContext(AuthContext)
  const {newTimer} = useContext(TimerContext)

  const isMine = currentUser._id === annotatedTask.user

  const taskPercentBudget = annotatedTask.estimate
    ? (annotatedTask.annotations.totalTaskHours / annotatedTask.estimate) * 100
    : 0

  const budgetColor: LinearProgressProps["color"] = (() => {
    if (!annotatedTask.estimate) return "inherit"
    if (taskPercentBudget > 100) return "error"
    if (taskPercentBudget > 75) return "warning"
    return "primary"
  })()

  return (
    <ListItem
      key={annotatedTask._id}
      disablePadding
      secondaryAction={
        <HoverHelp description="New timer">
          <IconButton
            onClick={() =>
              newTimer({
                project: annotatedTask.project,
                task: annotatedTask._id
              })
            }
          >
            <MoreTime />
          </IconButton>
        </HoverHelp>
      }
      sx={
        {
          // Divider between items
          // "&:not(:last-child)": {
          //   borderBottom: "1px solid #444"
          // }
        }
      }
    >
      <ListItemButton
        onClick={() => navigate(`/dashboard/tasks/${annotatedTask._id}`)}
        sx={{py: 3}}
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
            {annotatedTask.state.toUpperCase()} &nbsp;&#x2022;&nbsp;{" "}
            {annotatedTask.annotations.user?.email ?? "Unknown user"}
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
            {annotatedTask.summary}
          </Typography>

          <Typography
            sx={{mt: 1, mb: 0.25}}
            variant="body2"
            color={
              annotatedTask.estimate ? `${budgetColor}.dark` : "text.disabled"
            }
          >
            {annotatedTask.estimate
              ? `${annotatedTask.annotations.totalTaskHours.toFixed(1)} of ${
                  annotatedTask.estimate
                } hours`
              : `${annotatedTask.annotations.totalTaskHours.toFixed(
                  1
                )} hours – no estimate`}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, taskPercentBudget)}
            color={budgetColor}
            sx={{borderRadius: 2, height: 2}}
          />
        </ListItemText>
      </ListItemButton>
    </ListItem>
  )
}
