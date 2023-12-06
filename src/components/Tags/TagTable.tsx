import {Card, Typography} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import {randUuid} from "@ngneat/falso"
import {type Project} from "api/sdk"
import DialogForm from "components/DialogForm"
import {Tag} from "pages/ProjectDetail/TagTab"

import {type FC, useState, useContext, useEffect} from "react"
import {AuthContext} from "utils/context"

export interface TagTableProps {
  project: Project
  tags: Tag[]
  setTags: (Tag: Tag[]) => void
}

export const TagTable: FC<TagTableProps> = (props) => {
  const {project, tags, setTags} = props
  const {session} = useContext(AuthContext)

  const [selectedTag, setSelectedTag] = useState<string>()

  const deleteTag = async () => {
    if (selectedTag === undefined) return
    await session.project.modify(project._id, {
      projectTags: {SetRemoveInstances: [selectedTag]}
    })
    setTags(tags.filter((tag) => tag.name !== selectedTag))
    setSelectedTag(undefined)
  }

  return (
    <>
      <Card>
        <DataGrid
          autoHeight
          disableRowSelectionOnClick
          disableColumnMenu
          columns={[
            {
              field: "name",
              headerName: "tags",
              width: 1000
            }
          ]}
          rows={tags}
          onRowClick={(e) => setSelectedTag(e.row.name)}
          sx={{
            "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
              outline: "none !important"
            }
          }}
        />
      </Card>
      <DialogForm
        open={selectedTag !== undefined}
        onClose={() => setSelectedTag(undefined)}
        title="Delete Tag?"
        onSubmit={deleteTag}
        submitLabel="Delete Tag"
      >
        <Typography>Are you sure you want to delete {selectedTag}?</Typography>
      </DialogForm>
    </>
  )
}
export default TagTable
