import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Add, Pause, Person, PlayArrow, Warning} from "@mui/icons-material"
import {
  Box,
  IconButton,
  LinearProgress,
  LinearProgressProps,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext, TimerContext} from "utils/context"
import {AnnotatedTask} from "utils/useOldAnnotatedEndpoints"

dayjs.extend(duration)

export interface TaskListItemProps {
  annotatedTask: AnnotatedTask
}

export const TaskListItem: FC<TaskListItemProps> = ({annotatedTask}) => {
  const navigate = useNavigate()
  const {currentUser} = useContext(AuthContext)
  const {newTimer, timers, toggleTimer} = useContext(TimerContext)
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isMine = currentUser._id === annotatedTask.user

  const [timerKey] = Object.entries(timers).find(
    ([_key, timer]) => timer.task === annotatedTask._id
  ) ?? [undefined]
  const isPlaying = !!timerKey && !!timers[timerKey].lastStarted

  const taskPercentBudget = annotatedTask.estimate
    ? (annotatedTask._annotations.totalTaskHours / annotatedTask.estimate) * 100
    : 0

  const budgetColor: LinearProgressProps["color"] = (() => {
    if (!annotatedTask.estimate) return "inherit"
    if (taskPercentBudget > 100) return "error"
    if (taskPercentBudget > 75) return "warning"
    return "inherit"
  })()

  return (
    <ListItem
      key={annotatedTask._id}
      disablePadding
      secondaryAction={(() => {
        if (!timerKey) {
          return (
            <IconButton
              onClick={() =>
                newTimer({
                  project: annotatedTask.project,
                  task: annotatedTask._id
                })
              }
              sx={{color: "text.disabled"}}
            >
              <Add />
            </IconButton>
          )
        }

        if (isPlaying) {
          return (
            <IconButton onClick={() => toggleTimer(timerKey)}>
              <Pause color="success" />
            </IconButton>
          )
        }

        return (
          <IconButton onClick={() => toggleTimer(timerKey)}>
            <PlayArrow />
          </IconButton>
        )
      })()}
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
        sx={{py: 1}}
      >
        {isMine && (
          <HoverHelp description="Assigned to me">
            <ListItemIcon
              sx={{
                color: annotatedTask.emergency ? "error.main" : "primary.main"
              }}
            >
              {annotatedTask.emergency ? <Warning /> : <Person />}
            </ListItemIcon>
          </HoverHelp>
        )}
        <ListItemText sx={{width: "100%", mr: 3}} inset={!isMine}>
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              {annotatedTask.state.toUpperCase()} &nbsp;&#x2022;&nbsp;{" "}
              {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                (annotatedTask._annotations.user?.name ||
                  annotatedTask._annotations.user?.email) ??
                  "Unknown user"
              }
            </Typography>
            {!isMobile && (
              <Box sx={{width: "8rem"}}>
                <Typography
                  sx={{mt: 1, mb: 0.25}}
                  variant="body2"
                  color={
                    budgetColor === "inherit"
                      ? "text.disabled"
                      : `${budgetColor}.dark`
                  }
                >
                  {annotatedTask.estimate
                    ? `${annotatedTask._annotations.totalTaskHours.toFixed(
                        1
                      )} of ${annotatedTask.estimate} hours`
                    : `${annotatedTask._annotations.totalTaskHours.toFixed(
                        1
                      )} hours`}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, taskPercentBudget)}
                  color={budgetColor}
                  sx={{borderRadius: 2, height: 2, width: "100%"}}
                />
              </Box>
            )}
          </Stack>
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
        </ListItemText>
      </ListItemButton>
    </ListItem>
  )
}
