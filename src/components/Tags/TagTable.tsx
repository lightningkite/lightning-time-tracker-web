import {Card, Typography} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import {randUuid} from "@ngneat/falso"
import {type Project} from "api/sdk"
import DialogForm from "components/DialogForm"

import {type FC, useState} from "react"

export interface TagTableProps {
  project: Project
}

export const TagTable: FC<TagTableProps> = (props) => {
  const {project} = props

  const [openModal, setOpenModal] = useState(false)

  const mappedProjectTages = project.projectTags.map((tag) => ({
    id: randUuid(),
    name: tag
  }))

  function TODO(): Promise<unknown> {
    throw new Error("Function not implemented.")
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
          rows={mappedProjectTages}
          onRowClick={() => setOpenModal(true)}
          sx={{
            "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
              outline: "none !important"
            }
          }}
        />
      </Card>
      <DialogForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Delete Tag?"
        onSubmit={() => TODO()}
        submitLabel="Delete Tag"
      >
        <Typography>Are you sure you want to delete this tag?</Typography>
      </DialogForm>
    </>
  )
}
export default TagTable
