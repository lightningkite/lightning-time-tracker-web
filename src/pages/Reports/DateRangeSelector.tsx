import {MenuItem, TextField} from "@mui/material"
import dayjs, {Dayjs} from "dayjs"
import React, {FC, useEffect} from "react"

export interface SelectedMonth {
  monthIndex: number
  year: number
}

const selectedMonthOptions = (() => {
  const options: SelectedMonth[] = []

  for (let i = 0; i < 12; i++) {
    const month = dayjs().subtract(i, "month")

    options.push({
      monthIndex: month.month(),
      year: month.year()
    })
  }

  return options
})()

export interface DateRangeSelectorProps {
  setDateRange: (dateRange: [Dayjs, Dayjs]) => void
}

export const DateRangeSelector: FC<DateRangeSelectorProps> = (props) => {
  const {setDateRange} = props

  useEffect(
    () => setDateRange(getSelectedMonthDateRange(selectedMonthOptions[0])),
    []
  )

  return (
    <TextField
      select
      label="Month"
      defaultValue={0}
      onChange={(e) =>
        setDateRange(
          getSelectedMonthDateRange(selectedMonthOptions[+e.target.value])
        )
      }
    >
      {selectedMonthOptions.map((option, index) => (
        <MenuItem key={index} value={index}>
          {dayjs()
            .month(option.monthIndex)
            .year(option.year)
            .format("MMMM YYYY")}
        </MenuItem>
      ))}
    </TextField>
  )
}

function getSelectedMonthDateRange(
  selectedMonth: SelectedMonth
): [Dayjs, Dayjs] {
  const startOfMonth = dayjs()
    .year(selectedMonth.year)
    .month(selectedMonth.monthIndex)
    .startOf("month")

  const endOfMonth = dayjs()
    .year(selectedMonth.year)
    .month(selectedMonth.monthIndex)
    .endOf("month")

  return [startOfMonth, endOfMonth]
}
