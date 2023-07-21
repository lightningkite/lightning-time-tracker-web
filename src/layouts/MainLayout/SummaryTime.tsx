import type {Condition} from "@lightningkite/lightning-server-simplified"
import {Aggregate} from "@lightningkite/lightning-server-simplified"
import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {dateToISO, dayjsToISO} from "@lightningkite/react-lightning-helpers"
import {Skeleton, Typography, useMediaQuery, useTheme} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {
  formatLongDuration,
  getTimerSeconds,
  parsePreferences
} from "utils/helpers"

dayjs.extend(duration)

export const SummaryTime: FC = () => {
  const {session, currentUser, setCurrentUser} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [submittedSeconds, setSubmittedSeconds] = useState<number>()
  const [unsubmittedSeconds, setUnsubmittedSeconds] = useState(0)

  const preferences = parsePreferences(currentUser.webPreferences)

  const recalculateUnsubmittedSeconds = () => {
    if (!timers) return

    const seconds = timers.reduce(
      (acc, timer) => acc + getTimerSeconds(timer),
      0
    )

    setUnsubmittedSeconds(seconds)
  }

  const changeTime = () => {
    const previousPreferences = {...preferences}
    const summaryTime = preferences.summaryTime === "day" ? "week" : "day"
    const newPreferencesJSON = JSON.stringify({
      ...preferences,
      summaryTime
    })

    // Optimistically update the UI
    setCurrentUser({
      ...currentUser,
      webPreferences: newPreferencesJSON
    })

    session.user
      .modify(currentUser._id, {webPreferences: {Assign: newPreferencesJSON}})
      .catch(() =>
        // If the update fails, revert the UI
        setCurrentUser({
          ...currentUser,
          webPreferences: JSON.stringify(previousPreferences)
        })
      )
  }

  useEffect(() => {
    const interval = setInterval(recalculateUnsubmittedSeconds, 1000)
    return () => clearInterval(interval)
  }, [timers])

  useEffect(() => {
    setSubmittedSeconds(undefined)

    const dateCondition: Condition<string> =
      preferences.summaryTime === "day"
        ? {Equal: dateToISO(new Date())}
        : {
            GreaterThanOrEqual: dayjsToISO(dayjs().startOf("week"))
          }

    session.timeEntry
      .aggregate({
        aggregate: Aggregate.Sum,
        condition: {
          And: [{user: {Equal: currentUser._id}}, {date: dateCondition}]
        },
        property: "durationMilliseconds"
      })
      .then((milliseconds) => setSubmittedSeconds((milliseconds ?? 0) / 1000))
      .catch(console.error)
  }, [timers?.length, preferences.summaryTime])

  return (
    <HoverHelp
      description={preferences.summaryTime === "day" ? "Today" : "This Week"}
    >
      <Typography
        onClick={changeTime}
        fontSize={isMobile ? undefined : "1.2rem"}
        sx={{cursor: "pointer"}}
      >
        {submittedSeconds !== undefined ? (
          formatLongDuration(
            dayjs.duration(submittedSeconds + unsubmittedSeconds, "seconds")
          )
        ) : (
          <Skeleton variant="text" width={100} />
        )}
      </Typography>
    </HoverHelp>
  )
}
