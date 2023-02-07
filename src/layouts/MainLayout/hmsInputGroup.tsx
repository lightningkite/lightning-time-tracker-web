import {Stack, Typography} from "@mui/material"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {Timer, TimerContext} from "utils/context"
import HmsInputField from "./hmsInputField"

import duration, {Duration} from "dayjs/plugin/duration"
dayjs.extend(duration)

export interface HMS {
  hours: number
  minutes: number
  seconds: number
}

const HmsInputGroup: FC<{timerKey: string}> = ({timerKey}) => {
  const {timers, toggleTimer, updateTimer} = useContext(TimerContext)

  const [hms, setHms] = useState<HMS | null>(null)

  const timer = timers[timerKey]

  useEffect(() => {
    setHms(hmsFromTimer(timer))
    const interval = setInterval(() => setHms(hmsFromTimer(timer)), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (field: keyof HMS, value: number) => {
    console.log(field, value)
    if (!hms) return

    const newHms = {...hms, [field]: value}

    updateTimer(timerKey, {
      lastStarted: null,
      accumulatedSeconds:
        newHms.hours * 3600 + newHms.minutes * 60 + newHms.seconds
    })
  }

  const pause = () => timer.lastStarted && toggleTimer(timerKey)

  if (!hms) return <div></div>

  return (
    <Stack
      direction="row"
      divider={<Typography>:</Typography>}
      alignItems="center"
      spacing={1}
    >
      <HmsInputField
        value={hms.hours}
        onChange={(value) => handleChange("hours", value)}
        handlePause={pause}
      />

      <HmsInputField
        value={hms.minutes}
        onChange={(value) => handleChange("minutes", value)}
        handlePause={pause}
      />

      <HmsInputField
        value={hms.seconds}
        onChange={(value) => handleChange("seconds", value)}
        handlePause={pause}
      />
    </Stack>
  )
}

function hmsFromTimer(timer: Timer): HMS {
  const duration = timerToDuration(timer)

  return {
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds()
  }
}

function timerToDuration(timer: Timer): Duration {
  return dayjs.duration(
    (timer.lastStarted ? dayjs().diff(timer.lastStarted, "second") : 0) +
      timer.accumulatedSeconds,
    "second"
  )
}

export default HmsInputGroup
