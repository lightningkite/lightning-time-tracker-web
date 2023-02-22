import {FilterBar} from "@lightningkite/mui-lightning-components"
import dayjs, {Dayjs} from "dayjs"
import React, {FC} from "react"

export interface DateRange {
  start: Dayjs
  end: Dayjs
}

const PAY_PERIOD_END = 15

const dateRangeOptions: {label: string; value: DateRange}[] = [
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
  DATE_RANGE = "Date Range"
}

export interface ReportFiltersProps {
  setDateRange: (dateRange: DateRange) => void
}

export const DateRangeSelector: FC<ReportFiltersProps> = (props) => {
  const {setDateRange} = props

  return (
    <FilterBar
      filterOptions={[
        {
          type: "select",
          name: FilterNames.DATE_RANGE,
          placeholder: "Date Range",
          options: dateRangeOptions,
          optionToID: (option) => option.label,
          optionToLabel: (option) => option.label,
          defaultValue: dateRangeOptions[0],
          includeByDefault: true
        }
      ]}
      onActiveFiltersChange={(activeFilters) => {
        const dateRange: DateRange | undefined = activeFilters.find(
          (filter) => filter.filterOption.name === FilterNames.DATE_RANGE
        )?.value?.value

        if (dateRange) {
          setDateRange(dateRange)
        }
      }}
    />
  )
}
