import {Stack, Typography} from "@mui/material"
import {Project} from "api/sdk"
import dayjs from "dayjs"
import React, {FC} from "react"
import {formatDollars} from "utils/helpers"
import {DateRange} from "./DateRangeSelector"
import {SummarizeByProject} from "./ProjectReport"
import {projectedRevenue} from "./widgetHelpers"
import {WidgetLayout} from "./WidgetLayout"

export interface WidgetsProps {
  summarizeByProject: SummarizeByProject
  projects: Project[]
  dateRange: DateRange
}

export const Widgets: FC<WidgetsProps> = (props) => {
  const {summarizeByProject, projects, dateRange} = props

  const revenueDollarsToDate = Object.entries(summarizeByProject).reduce(
    (acc, [projectId, {projectHours: totalHours}]) => {
      const project = projects.find((project) => project._id === projectId)

      return acc + (project?.rate ?? 0) * totalHours
    },
    0
  )

  const isTodayWithinRange =
    dayjs().isBefore(dateRange.end) && dayjs().isAfter(dateRange.start)

  return (
    <Stack direction="row" spacing={2} sx={{overflowX: "scroll", mb: 3}}>
      <WidgetLayout title="Hours Worked">
        <Typography fontSize="2.5rem">
          {Object.values(summarizeByProject)
            .reduce((acc, {projectHours}) => acc + projectHours, 0)
            .toFixed(1)}
        </Typography>
      </WidgetLayout>

      <WidgetLayout title={isTodayWithinRange ? "Revenue to Date" : "Revenue"}>
        <Typography fontSize="2.5rem">
          {formatDollars(revenueDollarsToDate, false)}
        </Typography>
      </WidgetLayout>

      {isTodayWithinRange && (
        <WidgetLayout title="Projected">
          <Typography fontSize="2.5rem">
            {formatDollars(
              projectedRevenue(revenueDollarsToDate, dateRange),
              false
            )}
          </Typography>
        </WidgetLayout>
      )}
    </Stack>
  )
}
