import {MenuItem, TextField} from "@mui/material"
import dayjs from "dayjs"
import React, {FC} from "react"

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
  setSelectedMonth: (selectedMonth: SelectedMonth) => void
}

export const DateRangeSelector: FC<DateRangeSelectorProps> = (props) => {
  const {setSelectedMonth} = props

  return (
    <TextField
      select
      label="Month"
      defaultValue={0}
      onChange={(e) => setSelectedMonth(selectedMonthOptions[+e.target.value])}
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
