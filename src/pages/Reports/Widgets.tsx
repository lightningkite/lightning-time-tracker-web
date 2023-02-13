import {Stack, Typography} from "@mui/material"
import {Project} from "api/sdk"
import React, {FC} from "react"
import {formatDollars} from "utils/helpers"
import {SummarizeByProject} from "./Reports"
import {projectedRevenue} from "./widgetHelpers"
import {WidgetLayout} from "./WidgetLayout"

export interface WidgetsProps {
  tasksByProject: SummarizeByProject
  projects: Project[]
  isCurrentMonth: boolean
}

export const Widgets: FC<WidgetsProps> = (props) => {
  const {tasksByProject, projects, isCurrentMonth} = props

  const revenueDollarsToDate = Object.entries(tasksByProject).reduce(
    (acc, [projectId, {projectHours: totalHours}]) => {
      const project = projects.find((project) => project._id === projectId)

      return acc + (project?.rate ?? 0) * totalHours
    },
    0
  )

  return (
    <Stack direction="row" spacing={2} sx={{overflowX: "scroll", mb: 3}}>
      <WidgetLayout title="Hours Worked">
        <Typography fontSize="2.5rem">
          {Object.values(tasksByProject)
            .reduce((acc, {projectHours}) => acc + projectHours, 0)
            .toFixed(1)}
        </Typography>
      </WidgetLayout>

      <WidgetLayout title={isCurrentMonth ? "Revenue to Date" : "Revenue"}>
        <Typography fontSize="2.5rem">
          {formatDollars(revenueDollarsToDate, false)}
        </Typography>
      </WidgetLayout>

      {isCurrentMonth && (
        <WidgetLayout title="Projected">
          <Typography fontSize="2.5rem">
            {formatDollars(
              projectedRevenue(revenueDollarsToDate, isCurrentMonth),
              false
            )}
          </Typography>
        </WidgetLayout>
      )}
    </Stack>
  )
}
