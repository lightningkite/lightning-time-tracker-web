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
        <Stack>
          <Typography variant="body2" color="text.disabled">
            {project?.name}
          </Typography>
          <Typography
            fontWeight="bold"
            fontSize="1.2rem"
            sx={{
              // whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%"
            }}
          >
            {task?.summary}
          </Typography>
        </Stack>
        <Stack>
          <Typography
            variant="body2"
            color="primary"
            fontWeight="bold"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%"
            }}
          >
            {hmsString}
          </Typography>
          <Typography
            variant="body2"
            color="text.disabled"
            alignSelf="self-end"
            sx={{
              whiteSpace: "nowrap",
              // overflow: "hidden",
              // textOverflow: "ellipsis",
              width: "100%"
            }}
          >
            {dateValue}
          </Typography>
        </Stack>
      </Stack>
    </>
  )
}
