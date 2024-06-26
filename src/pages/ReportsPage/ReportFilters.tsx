import type {Condition} from "@lightningkite/lightning-server-simplified"
import type {FilterOption} from "@lightningkite/mui-lightning-components"
import {FilterBar} from "@lightningkite/mui-lightning-components"
import {Skeleton, Stack, Typography} from "@mui/material"
import type {Project, Task, TimeEntry, User} from "api/sdk"
import type {Dayjs} from "dayjs"
import dayjs from "dayjs"
import {usePermissions} from "hooks/usePermissions"
import type {Dispatch, FC, SetStateAction} from "react"
import {useContext, useEffect, useMemo, useState} from "react"
import {AuthContext} from "utils/context"
import type {ReportFilterValues} from "./ReportsPage"
import {DatePicker} from "@mui/x-date-pickers"

export interface DateRange {
  start: Dayjs
  end: Dayjs
}

const PAY_PERIOD_END = 15

const dateRangeOptions: {
  label: string
  value: DateRange
  payRelated?: boolean
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
    payRelated: true,
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
    payRelated: true,
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
  setReportFilterValues: Dispatch<
    SetStateAction<ReportFilterValues | undefined>
  >
}

export const ReportFilters: FC<ReportFiltersProps> = (props) => {
  const {setReportFilterValues} = props
  const {session, currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [users, setUsers] = useState<User[]>()
  const [projects, setProjects] = useState<Project[]>()
  const [customDate, setCustomDate] = useState<DateRange>()

  const changeCustomDate = (date: DateRange) => {
    setCustomDate(date)
    setReportFilterValues((prev) => (prev ? {...prev, dateRange: date} : prev))
  }

  const filterOptions = useMemo(() => {
    if (!users || !projects) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: FilterOption<any>[] = [
      {
        type: "select",
        name: FilterNames.DATE_RANGE,
        placeholder: "Date Range",
        options: [
          ...dateRangeOptions.filter(
            (o) => permissions.canSubmitTime || !o.payRelated
          ),
          {label: "Custom", value: undefined}
        ],
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
    ]

    return options.filter(
      (o) => permissions.canViewIndividualUsers || o.name !== FilterNames.USERS
    )
  }, [users, projects])

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
    <>
      <FilterBar
        filterOptions={filterOptions}
        onActiveFiltersChange={(activeFilters) => {
          const customDateRange = activeFilters.find(
            (f) => f.value?.label === "Custom"
          )
            ? customDate ?? {
                start: dayjs().startOf("month"),
                end: dayjs().endOf("month")
              }
            : undefined

          setCustomDate(customDateRange)
          const dateRange: DateRange | undefined = customDateRange
            ? customDateRange
            : activeFilters.find(
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
      {customDate && (
        <Stack direction="row" gap="1rem" my="1rem" alignItems="center">
          <DatePicker
            value={customDate.start}
            onChange={(date) =>
              date && changeCustomDate({...customDate, start: date})
            }
            maxDate={customDate.end}
          />
          <Typography variant="body1">to</Typography>
          <DatePicker
            value={customDate.end}
            onChange={(date) =>
              date && changeCustomDate({...customDate, end: date})
            }
            minDate={customDate.start}
          />
        </Stack>
      )}
    </>
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
    // Do not use dayjsToISO for the end date because it will switch to UTC time making the end date one day later

    conditions.push({
      date: {
        LessThanOrEqual: dayjs(dateRange.end).format("YYYY-MM-DD")
      }
    })

    conditions.push({
      date: {
        GreaterThanOrEqual: dayjs(dateRange.start).format("YYYY-MM-DD")
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

export default ReportFilters
