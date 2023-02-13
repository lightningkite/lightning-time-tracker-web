import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material"
import {User} from "api/sdk"
import React, {FC, useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AutoLoadingButton} from "../../components/AutoLoadingButton"

export const DeleteUserButton: FC<{user: User}> = ({user}) => {
  const {session} = useContext(AuthContext)
  const navigate = useNavigate()

  const [openDialog, setOpenDialog] = useState(false)

  const handleOpen = () => setOpenDialog(true)
  const handleClose = () => setOpenDialog(false)

  async function deleteUser() {
    await session.user
      .delete(user._id)
      .then(() => navigate("/users"))
      .catch(() => alert("Failed to delete user"))
  }

  return (
    <>
      <HoverHelp description={`Delete ${user.name || user.email}`}>
        <Button onClick={handleOpen} color="error">
          Delete
        </Button>
      </HoverHelp>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby={`alert-dialog-title-${user._id}`}
        aria-describedby={`alert-dialog-description-${user._id}`}
      >
        <DialogTitle id={`alert-dialog-title-${user._id}`}>
          Delete {user.name || user.email}?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id={`alert-dialog-description-${user._id}`}>
            Are you sure you want to delete {user.name || user.email}? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disableElevation>
            Cancel
          </Button>
          <AutoLoadingButton
            onClick={deleteUser}
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
