import {Condition} from "@lightningkite/lightning-server-simplified"
import {FilterBar} from "@lightningkite/mui-lightning-components"
import {Skeleton} from "@mui/material"
import {Project, Task, TimeEntry, User} from "api/sdk"
import dayjs, {Dayjs} from "dayjs"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import {ReportFilterValues} from "./ReportsPage"

export interface DateRange {
  start: Dayjs
  end: Dayjs
}

const PAY_PERIOD_END = 15

const dateRangeOptions: {
  label: string
  value: DateRange
  hideFromClient?: boolean
}[] = [
  {
    label: "Month",
    value: {
      start: dayjs().startOf("month"),
      end: dayjs().endOf("month")
    }
  },
  {
    label: "Month - previous",
    value: {
      start: dayjs().subtract(1, "month").startOf("month"),
      end: dayjs().subtract(1, "month").endOf("month")
    }
  },
  {
    label: "Week",
    value: {
      start: dayjs().startOf("week"),
      end: dayjs().endOf("week")
    }
  },
  {
    label: "Week - previous",
    value: {
      start: dayjs().subtract(1, "week").startOf("week"),
      end: dayjs().subtract(1, "week").endOf("week")
    }
  },
  {
    label: "Pay Period",
    hideFromClient: true,
    value:
      dayjs().date() <= PAY_PERIOD_END
        ? {
            start: dayjs().date(1),
            end: dayjs().date(PAY_PERIOD_END)
          }
        : {
            start: dayjs().date(PAY_PERIOD_END + 1),
            end: dayjs().endOf("month")
          }
  },
  {
    label: "Pay Period - previous",
    hideFromClient: true,
    value:
      dayjs().date() <= PAY_PERIOD_END
        ? {
            start: dayjs()
              .subtract(1, "month")
              .date(PAY_PERIOD_END + 1),
            end: dayjs().subtract(1, "month").endOf("month")
          }
        : {
            start: dayjs().date(1),
            end: dayjs().date(PAY_PERIOD_END)
          }
  }
]

enum FilterNames {
  DATE_RANGE = "Date Range",
  USERS = "Users",
  PROJECTS = "Projects"
}

export interface ReportFiltersProps {
  setReportFilterValues: (reportFilterValues: ReportFilterValues) => void
}

export const DateRangeSelector: FC<ReportFiltersProps> = (props) => {
  const {setReportFilterValues} = props
  const {session, currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [users, setUsers] = useState<User[]>()
  const [projects, setProjects] = useState<Project[]>()

  const isClient = !permissions.timeEntries

  useEffect(() => {
    session.user
      .query({condition: {organization: {Equal: currentUser.organization}}})
      .then(setUsers)
      .catch(console.error)
    session.project
      .query({condition: {organization: {Equal: currentUser.organization}}})
      .then(setProjects)
      .catch(console.error)
  }, [])

  if (!users || !projects) return <Skeleton height={70} />

  return (
    <FilterBar
      filterOptions={[
        {
          type: "select",
          name: FilterNames.DATE_RANGE,
          placeholder: "Date Range",
          options: dateRangeOptions.filter(
            (o) => !isClient || !o.hideFromClient
          ),
          optionToID: (o) => o.label,
          optionToLabel: (o) => o.label,
          defaultValue: dateRangeOptions[0],
          includeByDefault: true
        },
        {
          type: "multiSelect",
          name: FilterNames.USERS,
          placeholder: "Users",
          options: users.sort((a, b) => a.name.localeCompare(b.name)),
          optionToID: (u) => u._id,
          optionToLabel: (u) => u.name
        },
        {
          type: "multiSelect",
          name: FilterNames.PROJECTS,
          placeholder: "Projects",
          options: projects.sort((a, b) => a.name.localeCompare(b.name)),
          optionToID: (p) => p._id,
          optionToLabel: (p) => p.name
        }
      ]}
      onActiveFiltersChange={(activeFilters) => {
        const dateRange: DateRange | undefined = activeFilters.find(
          (filter) => filter.filterOption.name === FilterNames.DATE_RANGE
        )?.value?.value

        const users: User[] | undefined = activeFilters.find(
          (filter) => filter.filterOption.name === FilterNames.USERS
        )?.value

        const projects: Project[] | undefined = activeFilters.find(
          (filter) => filter.filterOption.name === FilterNames.PROJECTS
        )?.value

        setReportFilterValues({
          dateRange: dateRange ?? null,
          users: users ?? null,
          projects: projects ?? null
        })
      }}
    />
  )
}

export function filtersToProjectCondition(
  filters: ReportFilterValues
): Condition<Project> {
  const {projects} = filters

  return projects ? {_id: {Inside: projects.map((p) => p._id)}} : {Always: true}
}

export function filtersToUserCondition(
  filters: ReportFilterValues
): Condition<User> {
  const {users} = filters

  return users ? {_id: {Inside: users.map((u) => u._id)}} : {Always: true}
}

export function filtersToTaskCondition(
  filters: ReportFilterValues
): Condition<Task> {
  const {projects, users} = filters

  const conditions: Condition<Task>[] = []

  if (projects) {
    conditions.push({project: {Inside: projects.map((p) => p._id)}})
  }

  if (users) {
    conditions.push({user: {Inside: users.map((u) => u._id)}})
  }

  return {And: conditions}
}

export function filtersToTimeEntryCondition(
  filters: ReportFilterValues
): Condition<TimeEntry> {
  const {dateRange, users, projects} = filters
  const conditions: Condition<TimeEntry>[] = []

  if (dateRange) {
    conditions.push({
      date: {
        LessThanOrEqual: dateToISO(dateRange.end.toDate())
      }
    })

    conditions.push({
      date: {
        GreaterThanOrEqual: dateToISO(dateRange.start.toDate())
      }
    })
  }

  if (!!users?.length) {
    conditions.push({user: {Inside: users.map((u) => u._id)}})
  }

  if (!!projects?.length) {
    conditions.push({project: {Inside: projects.map((p) => p._id)}})
  }

  return {And: conditions}
}
