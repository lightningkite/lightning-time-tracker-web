import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {CheckCircle, Done, Undo} from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem
} from "@mui/material"
import {TaskState} from "api/sdk"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"

interface TaskStateAction {
  label: string
  nextState: TaskState
}

const actions: Record<
  TaskState,
  {back: TaskStateAction | null; next: TaskStateAction | null}
> = {
  [TaskState.Hold]: {
    back: null,
    next: {label: "Set Active", nextState: TaskState.Active}
  },
  [TaskState.Active]: {
    back: {label: "Hold", nextState: TaskState.Hold},
    next: {label: "Ready to Test", nextState: TaskState.Testing}
  },
  [TaskState.Testing]: {
    back: {label: "Needs Development", nextState: TaskState.Active},
    next: {label: "Approved", nextState: TaskState.Approved}
  },
  [TaskState.Approved]: {
    back: null,
    next: {label: "Delivered", nextState: TaskState.Delivered}
  },
  [TaskState.Delivered]: {
    back: null,
    next: null
  },
  [TaskState.Cancelled]: {
    back: null,
    next: null
  }
}

export interface TaskStateActionButtonProps {
  annotatedTask: AnnotatedTask
  refreshDashboard: () => Promise<void>
}

export const TaskStateActionButton: FC<TaskStateActionButtonProps> = (
  props
) => {
  const {annotatedTask, refreshDashboard} = props
  const {session} = useContext(AuthContext)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isChangingState, setIsChangingState] = useState(false)

  const open = !!anchorEl

  const next = actions[annotatedTask.state].next
  const back = actions[annotatedTask.state].back

  const handleClose = () => {
    setAnchorEl(null)
  }

  const changeTaskStatus = async (nextState: TaskState) => {
    handleClose()
    setIsChangingState(true)
    const updatedTask = await session.task
      .modify(annotatedTask._id, {state: {Assign: nextState}})
      .catch(() => alert("Error changing task state"))

    if (updatedTask) {
      await refreshDashboard()
    }
    setIsChangingState(false)
  }

  return (
    <>
      {isChangingState ? (
        <IconButton disabled>
          <CircularProgress size={20} />
        </IconButton>
      ) : (
        <HoverHelp description="Update status">
          <IconButton
            sx={{color: "text.secondary"}}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Done />
          </IconButton>
        </HoverHelp>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {next && (
          <MenuItem
            onClick={() => {
              changeTaskStatus(next.nextState)
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            {next.label}
          </MenuItem>
        )}

        {back && (
          <MenuItem
            onClick={() => {
              changeTaskStatus(back.nextState)
            }}
          >
            <ListItemIcon>
              <Undo fontSize="small" />
            </ListItemIcon>
            {back.label}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
