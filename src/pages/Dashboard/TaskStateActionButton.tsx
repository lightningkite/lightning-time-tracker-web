import {CheckCircle, Done, Undo} from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem
} from "@mui/material"
import {TaskState} from "api/sdk"
import {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"

interface TaskStateAction {
  label: string
  nextState: TaskState
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

  return (
    <>
      {isChangingState ? (
        <IconButton disabled>
          <CircularProgress size={20} />
        </IconButton>
      ) : (
        <IconButton
          sx={{color: "text.secondary"}}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Done />
        </IconButton>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {actions[annotatedTask.state].next && (
          <MenuItem
            onClick={() =>
              changeTaskStatus(actions[annotatedTask.state].next!.nextState)
            }
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            {actions[annotatedTask.state].next!.label}
          </MenuItem>
        )}

        {actions[annotatedTask.state].back && (
          <MenuItem
            onClick={() =>
              changeTaskStatus(actions[annotatedTask.state].back!.nextState)
            }
          >
            <ListItemIcon>
              <Undo fontSize="small" />
            </ListItemIcon>
            {actions[annotatedTask.state].back!.label}
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
