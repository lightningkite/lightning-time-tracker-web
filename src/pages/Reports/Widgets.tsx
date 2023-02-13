import {Stack, Typography} from "@mui/material"
import {Project} from "api/sdk"
import React, {FC} from "react"
import {formatDollars} from "utils/helpers"
import {TasksByProject} from "./Reports"
import {WidgetLayout} from "./WidgetLayout"

export interface WidgetsProps {
  tasksByProject: TasksByProject
  projects: Project[]
}

export const Widgets: FC<WidgetsProps> = (props) => {
  const {tasksByProject, projects} = props

  const revenueDollarsToDate = Object.entries(tasksByProject).reduce(
    (acc, [projectId, {totalHours}]) => {
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
            .reduce((acc, {totalHours}) => acc + totalHours, 0)
            .toFixed(1)}
        </Typography>
      </WidgetLayout>

      <WidgetLayout title="Revenue to Date">
        <Typography fontSize="2.5rem">
          {formatDollars(revenueDollarsToDate, false)}
        </Typography>
      </WidgetLayout>
    </Stack>
  )
}
