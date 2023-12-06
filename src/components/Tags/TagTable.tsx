import {Card, Typography} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"

import {type Project} from "api/sdk"
import DialogForm from "components/DialogForm"
import type {Tag} from "pages/ProjectDetail/TagTab"

import {type FC, useState, useContext} from "react"
import {AuthContext} from "utils/context"

export interface TagTableProps {
  project: Project
  tags: Tag[]
  updateTable: () => void
}

export const TagTable: FC<TagTableProps> = (props) => {
  const {project, tags, updateTable} = props
  const {session} = useContext(AuthContext)

  const [selectedTag, setSelectedTag] = useState<string>()

  const deleteTag = async () => {
    if (selectedTag === undefined) return
    Promise.all([
      session.project.modify(project._id, {
        projectTags: {SetRemoveInstances: [selectedTag]}
      }),
      session.task.bulkModify({
        condition: {project: {Equal: project._id}},
        modification: {tags: {SetRemoveInstances: [selectedTag]}}
      })
    ]).finally(() => updateTable())

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
