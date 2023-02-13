import {MenuItem, TextField} from "@mui/material"
import dayjs, {Dayjs} from "dayjs"
import React, {FC, useEffect} from "react"

export interface DateRange {
  start: Dayjs
  end: Dayjs
}

const dateRangeOptions: {label: string; value: DateRange}[] = [
  {
    label: "This Month",
    value: {
      start: dayjs().startOf("month"),
      end: dayjs().endOf("month")
    }
  },
  {
    label: "Last Month",
    value: {
      start: dayjs().subtract(1, "month").startOf("month"),
      end: dayjs().subtract(1, "month").endOf("month")
    }
  },
  {
    label: "This Week",
    value: {
      start: dayjs().startOf("week"),
      end: dayjs().endOf("week")
    }
  },
  {
    label: "Last Week",
    value: {
      start: dayjs().subtract(1, "week").startOf("week"),
      end: dayjs().subtract(1, "week").endOf("week")
    }
  }
]

export interface DateRangeSelectorProps {
  setDateRange: (dateRange: DateRange) => void
}

export const DateRangeSelector: FC<DateRangeSelectorProps> = (props) => {
  const {setDateRange} = props

  useEffect(() => setDateRange(dateRangeOptions[0].value), [])

  return (
    <TextField
      select
      label="Date Range"
      defaultValue={0}
      onChange={(e) => setDateRange(dateRangeOptions[+e.target.value].value)}
    >
      {dateRangeOptions.map((option, index) => (
        <MenuItem key={index} value={index}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
