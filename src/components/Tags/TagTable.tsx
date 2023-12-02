import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Card, Table} from "@mui/material"
import {DataGrid} from "@mui/x-data-grid"
import {Project} from "api/sdk"
import dayjs from "dayjs"
import {CustomToolbar} from "pages/ReportsPage/CustomToolbar"
import {filtersToTimeEntryCondition} from "pages/ReportsPage/ReportFilters"

import {type FC, useContext, useState, useEffect} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {dynamicFormatDate, MILLISECONDS_PER_HOUR} from "utils/helpers"

export interface TagTableProps {
  project: Project
}

export const TagTable: FC<TagTableProps> = (props) => {
  const {project} = props
  const {session} = useContext(AuthContext)

  const [tagTableData, setTagTableData] = useState<Project[]>()

  async function fetchReportData() {
    setTagTableData(undefined)

    const timeEntries = await session.project.query({
      condition: {
        And: [{Equal: project}]
      },
      limit: QUERY_LIMIT
    })

    setTagTableData(timeEntries)
  }

  useEffect(() => {
    fetchReportData()
  }, [project])

  // useEffect(() => {
  //   setTagTableData(project.projectTags)
  // }, [project.projectTags])

  console.log(project.projectTags)
  console.log(session.project)
  console.log(tagTableData)
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
              headerName: "tags",
              width: 1000
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
