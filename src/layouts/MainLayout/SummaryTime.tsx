import {Aggregate, Condition} from "@lightningkite/lightning-server-simplified"
import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Typography, useMediaQuery, useTheme} from "@mui/material"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {cloneElement, FC, useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"
import {dateToISO, getTimerSeconds, parsePreferences} from "utils/helpers"

dayjs.extend(duration)

export const SummaryTime: FC = () => {
  const {session, currentUser, setCurrentUser} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [submittedSeconds, setSubmittedSeconds] = useState<number>()
  const [unsubmittedSeconds, setUnsubmittedSeconds] = useState(0)

  const preferences = parsePreferences(currentUser?.webPreferences)

  const calculateUnsubmittedSeconds = () => {
    const seconds = Object.values(timers).reduce(
      (acc, timer) => acc + getTimerSeconds(timer),
      0
    )

    setUnsubmittedSeconds(seconds)
  }
  

  const changeTime = () => {
    const previousPreferences = {...preferences};
    const summaryTime = preferences.summaryTime === "day" ? "week" : "day"
    const pref = JSON.stringify({summaryTime})
    session.user
      .modify(currentUser._id, {webPreferences: {Assign: pref}})
      .then(setCurrentUser)
      .catch(() =>
        // If the update fails, revert the UI
        setCurrentUser({
          ...currentUser,
          webPreferences: JSON.stringify(previousPreferences)
        })
      )
  }

  useEffect(() => {
    const interval = setInterval(calculateUnsubmittedSeconds, 1000)
    return () => clearInterval(interval)
  }, [timers])

  useEffect(() => {
    const dateCondition: Condition<string> =
      preferences.summaryTime === "day"
        ? {Equal: dateToISO(new Date())}
        : {
            GreaterThanOrEqual: dateToISO(dayjs().startOf("week").toDate())
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
  }, [Object.keys(timers).length, preferences.summaryTime])

  return (
    <HoverHelp
      description={preferences.summaryTime === "day" ? "Today" : "This Week"}
    >
      <Typography onClick={changeTime} fontSize={isMobile ? undefined : "1.2rem"}>
        {submittedSeconds !== undefined
          ? dayjs
              .duration(submittedSeconds + unsubmittedSeconds, "seconds")
              .format("H : mm : ss")
          : "00 : 00 : 00"}
      </Typography>
    </HoverHelp>
  )
}
