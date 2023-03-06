import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Person, Warning} from "@mui/icons-material"
import {
  Box,
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
import {TaskModal} from "components/TaskModal"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {TaskPlayActionButton} from "./TaskPlayActionButton"
import {TaskStateActionButton} from "./TaskStateActionButton"

dayjs.extend(duration)

export interface TaskListItemProps {
  annotatedTask: AnnotatedTask
  refreshDashboard: () => Promise<void>
}

export const TaskListItem: FC<TaskListItemProps> = ({
  annotatedTask,
  refreshDashboard
}) => {
  const navigate = useNavigate()
  const {currentUser} = useContext(AuthContext)
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isMine = currentUser._id === annotatedTask.user
  const [showModal, setShowModal] = useState(false)

  const taskPercentBudget = annotatedTask.estimate
    ? (annotatedTask.annotations.totalTaskHours / annotatedTask.estimate) * 100
    : 0

  const budgetColor: LinearProgressProps["color"] = (() => {
    if (!annotatedTask.estimate) return "inherit"
    if (taskPercentBudget > 100) return "error"
    if (taskPercentBudget > 75) return "warning"
    return "inherit"
  })()

  return (
    <>
      <ListItem
        key={annotatedTask._id}
        disablePadding
        secondaryAction={
          <Stack direction="row" alignItems="center">
            <TaskStateActionButton
              annotatedTask={annotatedTask}
              refreshDashboard={refreshDashboard}
            />
            <TaskPlayActionButton annotatedTask={annotatedTask} />
          </Stack>
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
        <ListItemButton onClick={() => setShowModal(true)} sx={{py: 1}}>
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
          <ListItemText sx={{width: "100%", mr: 7}} inset={!isMine}>
            <Stack
              direction="row"
              alignItems="flex-end"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="body2" color="text.secondary">
                {annotatedTask.state.toUpperCase()} &nbsp;&#x2022;&nbsp;{" "}
                {annotatedTask.userName}
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
                      ? `${annotatedTask.annotations.totalTaskHours.toFixed(
                          1
                        )} of ${annotatedTask.estimate} hours`
                      : `${annotatedTask.annotations.totalTaskHours.toFixed(
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
                mr: 2,
                color: annotatedTask.emergency ? "error.main" : "text.primary"
              }}
            >
              {annotatedTask.summary}
            </Typography>
          </ListItemText>
        </ListItemButton>
      </ListItem>

      <TaskModal
        task={showModal ? annotatedTask : null}
        handleClose={() => setShowModal(false)}
        getEditRoute={(task) => `/dashboard/tasks/${task._id}`}
      />
    </>
  )
}
