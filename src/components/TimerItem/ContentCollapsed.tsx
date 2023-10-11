import {Stack, Typography} from "@mui/material"
import type {Project, Task, Timer} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {FC} from "react"
import React, {useEffect, useState} from "react"
import {getTimerSeconds} from "utils/helpers"

dayjs.extend(duration)

export interface ContentCollapsedProps {
  project: Project | null
  task: Task | null
  timer: Timer
  dateValue: string
}

export const ContentCollapsed: FC<ContentCollapsedProps> = (props) => {
  const {project, task, timer, dateValue} = props

  const [seconds, setSeconds] = useState(getTimerSeconds(timer))

  useEffect(() => {
    if (!timer.lastStarted) return

    const interval = setInterval(() => {
      setSeconds(getTimerSeconds(timer))
    }, 1000)

    return () => clearInterval(interval)
  }, [timer.lastStarted])

  const hmsString = dayjs.duration(seconds, "seconds").format("H : mm : ss")

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={0.5}
      >
        <Typography variant="body2" color="primary" fontWeight="bold">
          {hmsString}
        </Typography>
        <Typography variant="body2" color="text.disabled" flex="left">
          {project?.name}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {dateValue}
        </Typography>
      </Stack>

      <Typography
        fontWeight="bold"
        fontSize="1.2rem"
        sx={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%"
        }}
      >
        {task?.summary}
      </Typography>
    </>
  )
}
