import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Person, Warning} from "@mui/icons-material"
import type {
  LinearProgressProps} from "@mui/material";
import {
  Box,
  LinearProgress,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material"
import type {Task} from "api/sdk"
import {TaskModal} from "components/TaskModal"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react";
import React, { useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {taskStateLabels} from "utils/helpers"
import {TaskPlayActionButton} from "./TaskPlayActionButton"
import {TaskStateActionButton} from "./TaskStateActionButton"

dayjs.extend(duration)

export interface TaskListItemProps {
  annotatedTask: AnnotatedTask
  refreshDashboard: () => Promise<void>
  updateTask: (task: Task) => void
}

export const TaskListItem: FC<TaskListItemProps> = ({
  annotatedTask,
  refreshDashboard,
  updateTask
}) => {
  const {currentUser} = useContext(AuthContext)
  const theme = useTheme()
  const permissions = usePermissions()

  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isMine = currentUser._id === annotatedTask.user
  const [showModal, setShowModal] = useState(false)

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
            {permissions.canSubmitTime && (
              <TaskPlayActionButton annotatedTask={annotatedTask} />
            )}
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
                {taskStateLabels[annotatedTask.state].toUpperCase()}{" "}
                &nbsp;&#x2022;&nbsp; {annotatedTask.userName}
              </Typography>
              {!isMobile && permissions.canSubmitTime && (
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
                      ? // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        `${annotatedTask._annotations.totalTaskHours.toFixed(
                          1
                        )} of ${annotatedTask.estimate} hours`
                      : // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        `${annotatedTask._annotations.totalTaskHours.toFixed(
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
        setTask={updateTask}
      />
    </>
  )
}
