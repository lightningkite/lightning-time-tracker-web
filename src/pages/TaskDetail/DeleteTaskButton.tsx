import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material"
import type {Task} from "api/sdk"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AutoLoadingButton} from "../../components/AutoLoadingButton"

export const DeleteTaskButton: FC<{task: Task}> = ({task}) => {
  const {session} = useContext(AuthContext)
  const navigate = useNavigate()

  const [openDialog, setOpenDialog] = useState(false)

  const handleOpen = () => setOpenDialog(true)
  const handleClose = () => setOpenDialog(false)

  async function deleteTask() {
    await session.task
      .delete(task._id)
      .then(() => navigate(-1))
      .catch(() => alert("Failed to delete task"))
  }

  return (
    <>
      <HoverHelp description="Delete Task">
        <Button onClick={handleOpen} color="error">
          Delete
        </Button>
      </HoverHelp>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby={`alert-dialog-title-${task._id}`}
        aria-describedby={`alert-dialog-description-${task._id}`}
      >
        <DialogTitle id={`alert-dialog-title-${task._id}`}>
          Delete Task?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id={`alert-dialog-description-${task._id}`}>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disableElevation>
            Cancel
          </Button>
          <AutoLoadingButton
            onClick={deleteTask}
            variant="contained"
            color="error"
            disableElevation
          >
            Delete
          </AutoLoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
