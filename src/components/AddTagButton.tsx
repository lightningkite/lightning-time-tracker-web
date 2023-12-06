import {Add} from "@mui/icons-material"
import type {SxProps} from "@mui/material"
import {Button, TextField} from "@mui/material"
import type {Project} from "api/sdk"
import {useState, type FC, useContext} from "react"
import DialogForm from "./DialogForm"
import {AuthContext} from "utils/context"
import type {Tag} from "pages/ProjectDetail/TagTab"
import {randUuid} from "@ngneat/falso"

export interface AddTagButtonProps {
  afterSubmit?: () => void
  project: Project
  sx?: SxProps
  tags: Tag[]
  setTags: (Tag: Tag[]) => void
}

export const AddTagButton: FC<AddTagButtonProps> = (props) => {
  const {project, sx, tags, setTags} = props
  const {session} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTag, setNewTag] = useState("")

  const submitting = () => {
    setTags([
      ...tags,
      {
        id: randUuid(),
        name: newTag
      }
    ])
    return session.project
      .modify(project._id, {
        projectTags: {SetAppend: [newTag]}
      })
      .then(() => {
        setShowCreateForm(false)
      })
  }
  console.log(project.projectTags)
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
        onClose={() => setShowCreateForm(false)}
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
