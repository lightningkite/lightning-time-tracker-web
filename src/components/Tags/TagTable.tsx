import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Card, Table} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import {Project} from "api/sdk"
import dayjs from "dayjs"
import {CustomToolbar} from "pages/ReportsPage/CustomToolbar"

import {type FC, useContext, useState, useEffect} from "react"
import {AuthContext} from "utils/context"
import {dynamicFormatDate, MILLISECONDS_PER_HOUR} from "utils/helpers"

export interface TagTableProps {
  project: Project
}

export const TagTable: FC<TagTableProps> = (props) => {
  const {project} = props
  const {session} = useContext(AuthContext)

  const [tagTableData, setTagTableData] = useState<Project[]>()

  // useEffect(() => {
  //   setTagTableData(project.projectTags)
  // }, [project.projectTags])

  console.log(project.projectTags)
  console.log(session.project)
  return (
    <>
      <Card>
        <DataGrid
          autoHeight
          // loading={!project.projectTags}
          disableRowSelectionOnClick
          disableColumnMenu
          columns={[
            {
              field: "projectTags",
              headerName: "Tags"
            }
          ]}
          // initialState={{
          //   sorting: {
          //     sortModel: [{field: "date", sort: "desc"}]
          //   }
          // }}
          rows={tagTableData ?? []}
          getRowId={(r) => r._id}
          // components={{Toolbar: CustomToolbar}}
          // componentsProps={{
          //   toolbar: {
          //     filters: reportFilterValues,
          //     filePrefix: "Time Entries"
          //   }
          // }}
          sx={{
            "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
              outline: "none !important"
            }
          }}
        />
      </Card>
    </>
  )
}
export default TagTable
