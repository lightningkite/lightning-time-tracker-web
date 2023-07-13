import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material"
import type {Project} from "api/sdk"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AutoLoadingButton} from "../../components/AutoLoadingButton"

export const DeleteProjectButton: FC<{project: Project}> = ({project}) => {
  const {session} = useContext(AuthContext)
  const navigate = useNavigate()

  const [openDialog, setOpenDialog] = useState(false)

  const handleOpen = () => setOpenDialog(true)
  const handleClose = () => setOpenDialog(false)

  async function deleteProject() {
    await session.project
      .delete(project._id)
      .then(() => navigate("/projects"))
      .catch(() => alert("Failed to delete project"))
  }

  return (
    <>
      <HoverHelp description={`Delete ${project.name}`}>
        <Button onClick={handleOpen} color="error">
          Delete
        </Button>
      </HoverHelp>

      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby={`alert-dialog-title-${project._id}`}
        aria-describedby={`alert-dialog-description-${project._id}`}
      >
        <DialogTitle id={`alert-dialog-title-${project._id}`}>
          Delete {project.name}?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id={`alert-dialog-description-${project._id}`}>
            Are you sure you want to delete {project.name}? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disableElevation>
            Cancel
          </Button>
          <AutoLoadingButton
            onClick={deleteProject}
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
