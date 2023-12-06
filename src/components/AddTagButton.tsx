import {Add} from "@mui/icons-material"
import type {SxProps} from "@mui/material"
import {Button, TextField} from "@mui/material"
import type {Project} from "api/sdk"
import {useState, type FC, useContext} from "react"
import DialogForm from "./DialogForm"
import {AuthContext} from "utils/context"

export interface AddTagButtonProps {
  afterSubmit?: () => void
  project: Project
  sx?: SxProps
  updateTable: () => void
}

export const AddTagButton: FC<AddTagButtonProps> = (props) => {
  const {project, sx, updateTable} = props
  const {session} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTag, setNewTag] = useState("")

  const onClose = () => {
    setShowCreateForm(false)
    setNewTag("")
  }

  const submitting = () => {
    return session.project
      .modify(project._id, {
        projectTags: {SetAppend: [newTag.trim().toLowerCase()]}
      })
      .then(() => {
        setShowCreateForm(false)
      })
      .finally(() => {
        updateTable()
      })
  }

  return (
    <>
      <Button
        onClick={() => setShowCreateForm(true)}
        startIcon={<Add />}
        sx={sx}
      >
        Create Tag
      </Button>

      <DialogForm
        title="New Tag"
        open={showCreateForm}
        onClose={onClose}
        onSubmit={submitting}
      >
        <TextField
          label="Create New Tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          fullWidth
        />
      </DialogForm>
    </>
  )
}
