import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {Stack, Typography} from "@mui/material"
import {Project} from "api/sdk"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {QUERY_LIMIT} from "utils/constants"
import {AuthContext} from "utils/context"
import {dateToISO, formatDollars, MILLISECONDS_PER_HOUR} from "utils/helpers"
import {filtersToTimeEntryCondition} from "./ReportFilters"
import {ReportProps} from "./ReportsPage"
import {projectedRevenue} from "./widgetHelpers"
import {WidgetLayout} from "./WidgetLayout"

export const Widgets: FC<ReportProps> = (props) => {
  const {reportFilterValues} = props
  const {dateRange} = reportFilterValues
  const {session, currentUser} = useContext(AuthContext)

  const [totalHours, setTotalHours] = useState<number>()
  const [revenueDollarsBeforeToday, setRevenueDollarsBeforeToday] =
    useState<number>()
  const [revenueDollarsToDate, setRevenueDollarsToDate] = useState<number>()

  const timeEntryCondition = {
    And: [
      filtersToTimeEntryCondition(reportFilterValues),
      {organization: {Equal: currentUser.organization}}
    ]
  }

  useEffect(() => {
    setTotalHours(undefined)

    const totalMillisecondsRequest = session.timeEntry.aggregate({
      aggregate: Aggregate.Sum,
      condition: timeEntryCondition,
      property: "durationMilliseconds"
    })

    const projectsRequest = session.project.query({
      limit: QUERY_LIMIT
    })

    const millisecondsByProjectRequest = session.timeEntry.groupAggregate({
      aggregate: Aggregate.Sum,
      condition: timeEntryCondition,
      groupBy: "project",
      property: "durationMilliseconds"
    })

    const pastMillisecondsByProjectRequest = session.timeEntry.groupAggregate({
      aggregate: Aggregate.Sum,
      condition: {
        And: [
          timeEntryCondition,
          ...(dateRange
            ? [
                {
                  date: {
                    LessThan: dateToISO(dateRange.end.toDate())
                  }
                }
              ]
            : [])
        ]
      },
      groupBy: "project",
      property: "durationMilliseconds"
    })

    Promise.all([
      totalMillisecondsRequest,
      projectsRequest,
      millisecondsByProjectRequest,
      pastMillisecondsByProjectRequest
    ]).then(
      ([
        totalMillisecondsResponse,
        projectsResponse,
        millisecondsByProjectResponse,
        pastMillisecondsByProjectResponse
      ]) => {
        setTotalHours((totalMillisecondsResponse ?? 0) / MILLISECONDS_PER_HOUR)

        setRevenueDollarsToDate(
          msByProjectToAmount(projectsResponse, millisecondsByProjectResponse)
        )

        setRevenueDollarsBeforeToday(
          msByProjectToAmount(
            projectsResponse,
            pastMillisecondsByProjectResponse
          )
        )
      }
    )
  }, [reportFilterValues])

  const isTodayWithinRange =
    dateRange &&
    !dayjs().isAfter(dateRange.end, "day") &&
    !dayjs().isBefore(dateRange.start, "day")

  return (
    <Stack direction="row" spacing={2} sx={{overflowX: "scroll", mb: 3}}>
      {!currentUser.isClient && (
        <WidgetLayout title="Efficiency">
          <Typography
            fontSize="2.5rem"
            sx={{
              "& span": {
                fontSize: "1.5rem",
                color: "text.secondary",
                marginLeft: 1
              }
            }}
          >
            {revenueDollarsToDate && totalHours
              ? formatDollars(revenueDollarsToDate / totalHours, false)
              : "-"}
            <span>/hr</span>
          </Typography>
        </WidgetLayout>
      )}

      {isTodayWithinRange && !currentUser.isClient && (
        <WidgetLayout title="Projected">
          <Typography fontSize="2.5rem">
            {revenueDollarsBeforeToday
              ? formatDollars(
                  projectedRevenue(revenueDollarsBeforeToday, dateRange),
                  false
                )
              : "-"}
          </Typography>
        </WidgetLayout>
      )}

      <WidgetLayout
        title={(() => {
          if (isTodayWithinRange) {
            return currentUser.isClient
              ? "Est. Bill to Date"
              : "Revenue to Date"
          } else {
            return currentUser.isClient ? "Est. Bill" : "Revenue"
          }
        })()}
      >
        <Typography fontSize="2.5rem">
          {revenueDollarsToDate
            ? formatDollars(revenueDollarsToDate, false)
            : "-"}
        </Typography>
      </WidgetLayout>

      <WidgetLayout title="Hours Worked">
        <Typography fontSize="2.5rem">
          {totalHours?.toFixed(1) ?? "-"}
        </Typography>
      </WidgetLayout>
    </Stack>
  )
}

function msByProjectToAmount(
  projects: Project[],
  msByProject: Record<string, number | null | undefined>
): number {
  return projects.reduce((sum, project) => {
    const projectMilliseconds = msByProject[project._id] ?? 0
    const projectHours = projectMilliseconds / MILLISECONDS_PER_HOUR
    const projectRevenue = projectHours * (project.rate ?? 0)
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return sum + projectRevenue
  }, 0)
}
