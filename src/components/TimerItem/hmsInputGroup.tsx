import {Stack, Typography} from "@mui/material"
import type {Timer} from "api/sdk"
import dayjs from "dayjs"
import type {Duration} from "dayjs/plugin/duration"
import duration from "dayjs/plugin/duration"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {TimerContext} from "utils/context"
import HmsInputField from "./hmsInputField"

dayjs.extend(duration)

export interface HMS {
  hours: number
  minutes: number
  seconds: number
}

const HmsInputGroup: FC<{timer: Timer}> = ({timer}) => {
  const {toggleTimer, updateTimer} = useContext(TimerContext)

  const [hms, setHms] = useState<HMS>(hmsFromTimer(timer))

  useEffect(() => {
    setHms(hmsFromTimer(timer))
    const interval = setInterval(() => setHms(hmsFromTimer(timer)), 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleChange = (field: keyof HMS, value: number) => {
    const newHms = {...hms, [field]: value}

    updateTimer(timer._id, {
      lastStarted: null,
      accumulatedSeconds:
        newHms.hours * 3600 + newHms.minutes * 60 + newHms.seconds
    })
  }

  const pause = () => timer.lastStarted && toggleTimer(timer._id)

  return (
    <Stack
      direction="row"
      divider={<Typography>:</Typography>}
      alignItems="center"
      spacing={1}
      mr="auto"
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
