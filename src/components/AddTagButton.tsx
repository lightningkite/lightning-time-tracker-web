import {Add} from "@mui/icons-material"
import {Button, TextField} from "@mui/material"
import {UserRole, type Project} from "api/sdk"
import {useState, type FC, useContext} from "react"
import DialogForm from "./DialogForm"
import {AuthContext} from "utils/context"

export interface AddTagButtonProps {
  project: Project
  updateTable: () => void
}

export const AddTagButton: FC<AddTagButtonProps> = (props) => {
  const {project, updateTable} = props
  const {session, currentUser} = useContext(AuthContext)

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
        updateTable()
      })
  }

  return (
    <>
      {(currentUser.role == UserRole.Owner ||
        currentUser.role === UserRole.InternalTeamMember) && (
        <>
          <Button
            onClick={() => setShowCreateForm(true)}
            startIcon={<Add />}
            sx={{mb: 1}}
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
      )}
    </>
  )
}
