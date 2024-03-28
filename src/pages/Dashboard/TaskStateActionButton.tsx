import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {CheckCircle, Done, Undo} from "@mui/icons-material"
import {
  CircularProgress,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem
} from "@mui/material"
import {type Task, TaskState} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import {useFormik} from "formik"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"
import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {PullRequestSection} from "components/PullRequestSection/PullRequestSection"

interface TaskStateAction {
  label: string
  nextState: TaskState
}

const actions: Record<
  TaskState,
  {back: TaskStateAction | null; next: TaskStateAction[] | null}
> = {
  [TaskState.Hold]: {
    back: null,
    next: [{label: "Set Active", nextState: TaskState.Active}]
  },
  [TaskState.Active]: {
    back: {label: "Hold", nextState: TaskState.Hold},
    next: [
      {label: "Pull Request", nextState: TaskState.PullRequest},
      {label: "Ready to Test", nextState: TaskState.Testing}
    ]
  },
  [TaskState.PullRequest]: {
    back: {label: "Needs Development", nextState: TaskState.Active},
    next: [{label: "Ready to Test", nextState: TaskState.Testing}]
  },
  [TaskState.Testing]: {
    back: {label: "Needs Development", nextState: TaskState.Active},
    next: [{label: "Approved", nextState: TaskState.Approved}]
  },
  [TaskState.Approved]: {
    back: null,
    next: [{label: "Delivered", nextState: TaskState.Delivered}]
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

const validationSchema = yup.object().shape({
  url: yup.string().required("Required")
})

export const TaskStateActionButton: FC<TaskStateActionButtonProps> = (
  props
) => {
  const {annotatedTask, refreshDashboard} = props
  const {session} = useContext(AuthContext)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isChangingState, setIsChangingState] = useState(false)
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const handleModalClose = () => {
    setModalIsOpen(false)
    formik.resetForm()
  }

  const open = !!anchorEl

  const next = actions[annotatedTask.state].next
  const back = actions[annotatedTask.state].back

  const handleClose = () => {
    setAnchorEl(null)
  }

  const changeTaskStatus = async (nextState: TaskState) => {
    handleClose()
    if (nextState === TaskState.PullRequest) {
      setModalIsOpen(true)
      return
    }
    setIsChangingState(true)
    const updatedTask = await session.task
      .modify(annotatedTask._id, {state: {Assign: nextState}})
      .catch(() => alert("Error changing task state"))

    if (updatedTask) {
      await refreshDashboard()
    }
    setIsChangingState(false)
  }
  const formik = useFormik({
    initialValues: {
      url: annotatedTask.pullRequestLink ?? []
    },
    validationSchema,
    onSubmit: async (values) => {
      const task: Partial<Task> = {
        pullRequestLink: values.url,
        state: TaskState.PullRequest
      }
      const modification = makeObjectModification(annotatedTask, task)
      await session.task.modify(annotatedTask._id, modification)
      await refreshDashboard()
      handleModalClose()
    }
  })

  return (
    <>
      <DialogForm
        title="Submit Pull Request URL"
        open={modalIsOpen}
        onClose={handleModalClose}
        onSubmit={async () => {
          await formik.submitForm()
          if (shouldPreventSubmission(formik)) {
            throw new Error("Please fix the errors above.")
          }
        }}
      >
        <PullRequestSection
          edit
          url={formik.values.url}
          setUrl={(u) => formik.setFieldValue("url", u)}
        />
      </DialogForm>
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
        {next?.map((next) => (
          <MenuItem
            key={next.nextState}
            onClick={() => {
              changeTaskStatus(next.nextState)
            }}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            {next.label}
          </MenuItem>
        ))}

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
