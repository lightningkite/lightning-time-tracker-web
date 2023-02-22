import {GridToolbarContainer, GridToolbarExport} from "@mui/x-data-grid"
import React from "react"
import {ReportFilterValues} from "./ReportsPage"

export function CustomToolbar(props: {
  filters: ReportFilterValues
  filePrefix: string
}) {
  const fileName = props.filePrefix + " - " + filtersToFileName(props.filters)
  console.log(fileName)

  return (
    <GridToolbarContainer sx={{justifyContent: "flex-end"}}>
      <GridToolbarExport
        printOptions={{disableToolbarButton: true}}
        csvOptions={{fileName}}
      />
    </GridToolbarContainer>
  )
}

function filtersToFileName(filters: ReportFilterValues): string {
  const {dateRange, users, projects} = filters
  const fileNameParts: string[] = []

  if (dateRange) {
    const isRangeMonth =
      dateRange.start.isSame(dateRange.end.startOf("month"), "date") &&
      dateRange.end.isSame(dateRange.end.endOf("month"), "date")

    if (isRangeMonth) {
      fileNameParts.push(dateRange.start.format("MMM YYYY"))
    } else {
      fileNameParts.push(
        `${dateRange.start.format("MMMDD")}-${dateRange.end.format("MMMDD")}`
      )
    }
  }

  if (users) {
    fileNameParts.push(users.map((u) => u.name).join(", "))
  }

  if (projects) {
    fileNameParts.push(projects.map((p) => p.name).join(", "))
  }

  return fileNameParts.join(", ")
}
