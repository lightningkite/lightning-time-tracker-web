import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {Card} from "@mui/material"
import {DataGrid, GridEnrichedColDef} from "@mui/x-data-grid"
import {Project, User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {MILLISECONDS_PER_HOUR} from "utils/helpers"
import {
  filtersToProjectCondition,
  filtersToTimeEntryCondition,
  filtersToUserCondition
} from "./ReportFilters"
import {ReportProps} from "./ReportsPage"

interface HoursTableRow {
  user: User
  projectMilliseconds: Record<string, number | null | undefined>
}

export const ProjectsReport: FC<ReportProps> = (props) => {
  const {reportFilterValues} = props
  const {session} = useContext(AuthContext)

  const [tableData, setTableData] = useState<HoursTableRow[]>()
  const [users, setUsers] = useState<User[]>()
  const [projects, setProjects] = useState<Project[]>()
  const [msByProject, setMsByProject] =
    useState<Record<string, number | null | undefined>>()

  const [error, setError] = useState("")

  async function fetchReportData() {
    setTableData(undefined)

    const [users, projects, timeByProject] = await Promise.all([
      session.user.query({
        condition: filtersToUserCondition(reportFilterValues)
      }),
      session.project.query({
        condition: filtersToProjectCondition(reportFilterValues)
      }),
      session.timeEntry.groupAggregate({
        condition: filtersToTimeEntryCondition(reportFilterValues),
        aggregate: Aggregate.Sum,
        property: "durationMilliseconds",
        groupBy: "project"
      })
    ])

    setUsers(users)
    setProjects(projects)
    setMsByProject(timeByProject)

    const userTimeRequests = users.map((user) =>
      session.timeEntry.groupAggregate({
        condition: {
          And: [
            {user: {Equal: user._id}},
            filtersToTimeEntryCondition(reportFilterValues)
          ]
        },
        aggregate: Aggregate.Sum,
        property: "durationMilliseconds",
        groupBy: "project"
      })
    )

    const userTimeResponses = await Promise.all(userTimeRequests)

    setTableData(
      userTimeResponses.map((projectMilliseconds, i) => ({
        user: users[i],
        projectMilliseconds
      }))
    )
  }

  useEffect(() => {
    fetchReportData().catch(() => setError("Error fetching report data"))
  }, [reportFilterValues])

  if (error) {
    return <ErrorAlert>{error}</ErrorAlert>
  }

  return (
    <Card>
      <DataGrid
        autoHeight
        loading={!users || !tableData || !projects}
        disableSelectionOnClick
        disableColumnMenu
        columns={[
          {
            field: "user",
            headerName: "User",
            width: 200,
            valueGetter: ({row}) => row.user.name || row.user.email
          },
          {
            field: "total",
            headerName: "Total",
            width: 80,
            type: "number",
            valueGetter: ({row}) =>
              Object.values(row.projectMilliseconds).reduce<number>(
                (acc, milliseconds) => acc + (milliseconds ?? 0),
                0
              ),
            valueFormatter: ({value}) =>
              (value / MILLISECONDS_PER_HOUR).toFixed(1)
          },
          ...(!projects || !msByProject
            ? []
            : projects.sort(
                (a, b) => (msByProject[b._id] ?? 0) - (msByProject[a._id] ?? 0)
              )
          ).map((project) => {
            const column: GridEnrichedColDef<HoursTableRow> = {
              field: project._id,
              headerName: project.name,
              minWidth: Math.min(200, project.name.length * 7 + 50),
              flex: 1,
              type: "number",
              valueGetter: ({row}) => row.projectMilliseconds[project._id] ?? 0,
              valueFormatter: ({value}) =>
                value ? (value / MILLISECONDS_PER_HOUR).toFixed(1) : "–"
            }

            return column
          })
        ]}
        initialState={{
          sorting: {
            sortModel: [{field: "user", sort: "asc"}]
          }
        }}
        rows={tableData ?? []}
        getRowId={(r) => r.user._id}
        hideFooter
        sx={{
          "& .MuiDataGrid-cell, .MuiDataGrid-columnHeader": {
            outline: "none !important"
          }
        }}
      />
    </Card>
  )
}
