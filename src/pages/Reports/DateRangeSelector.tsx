import {MenuItem, Stack, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import dayjs, {Dayjs} from "dayjs"
import React, {FC, useEffect, useState} from "react"

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

export interface DateRangeSelectorProps {
  setDateRange: (dateRange: DateRange) => void
  dateRange: DateRange | undefined
}

export const DateRangeSelector: FC<DateRangeSelectorProps> = (props) => {
  const {setDateRange, dateRange} = props

  const [selectorValue, setSelectorValue] = useState(0)

  useEffect(() => {
    selectorValue !== -1 && setDateRange(dateRangeOptions[selectorValue].value)
  }, [selectorValue])

  return (
    <Stack direction="row" mb={2} spacing={2}>
      <TextField
        select
        label="Date Range"
        value={selectorValue}
        onChange={(e) => setSelectorValue(+e.target.value)}
        helperText={
          dateRange &&
          `${dateRange.start.format("MMM D")} - ${dateRange.end.format(
            "MMM D"
          )}`
        }
      >
        {dateRangeOptions.map((option, index) => (
          <MenuItem key={index} value={index}>
            {option.label}
          </MenuItem>
        ))}
        <MenuItem value={-1}>Custom</MenuItem>
      </TextField>

      {selectorValue === -1 && dateRange && (
        <>
          <DatePicker
            label="Start"
            value={dateRange.start}
            onChange={(newValue) =>
              newValue && setDateRange({...dateRange, start: newValue})
            }
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End"
            value={dateRange.end}
            onChange={(newValue) =>
              newValue && setDateRange({...dateRange, end: newValue})
            }
            renderInput={(params) => <TextField {...params} />}
          />
        </>
      )}
    </Stack>
  )
}
