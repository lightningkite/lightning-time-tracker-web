import {useThrottle} from "@lightningkite/mui-lightning-components"
import dayjs from "dayjs"
import {useContext, useEffect, useState} from "react"
import {LocalStorageKey} from "../utils/constants"
import {AuthContext, Timer, TimerContextType} from "../utils/context"
import {dateToISO, getTimerSeconds} from "../utils/helpers"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

type ParsedTimer = Omit<Timer, "lastStarted"> & {
  lastStarted: string | null
}

export const useGlobalTimerManager = (): TimerContextType => {
  const {session, currentUser} = useContext(AuthContext)

  const [timers, setTimers] = useState<Record<string, Timer>>(() => {
    try {
      const storedTimers = localStorage.getItem(LocalStorageKey.TIMERS)
      const parsedTimers = JSON.parse(storedTimers ?? "{}") as Record<
        string,
        ParsedTimer
      >

      const formattedTimers: Record<string, Timer> = Object.entries(
        parsedTimers
      ).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: {
            ...value,
            lastStarted: value.lastStarted ? dayjs(value.lastStarted) : null
          }
        }),
        {}
      )

      return formattedTimers
    } catch {
      return {}
    }
  })

  const debouncedTimers = useThrottle(timers, 500)

  useEffect(() => {
    localStorage.setItem(
      LocalStorageKey.TIMERS,
      JSON.stringify(debouncedTimers)
    )
  }, [debouncedTimers])

  function removeTimer(key: string): void {
    setTimers((prev) => {
      const {[key]: _, ...rest} = prev
      return rest
    })
  }

  function updateTimer(key: string, updates: Partial<Timer>): void {
    if (!timers[key]) {
      alert("Timer not found")
      return
    }

    setTimers((prev) => {
      const newTimers = {...prev}
      newTimers[key] = {
        ...newTimers[key],
        ...updates
      }
      return newTimers
    })
  }

  function startTimer(key: string): void {
    setTimers((prev) => {
      const newTimers = {...prev}
      newTimers[key].lastStarted = dayjs()
      return newTimers
    })
  }

  function stopTimer(key: string): void {
    const timer = timers[key]

    setTimers((prev) => {
      if (!timer.lastStarted) return prev

      const newTimers = {...prev}

      newTimers[key].accumulatedSeconds =
        timer.accumulatedSeconds + dayjs().diff(timer.lastStarted, "second")
      newTimers[key].lastStarted = null
      return newTimers
    })
  }

  function toggleTimer(keyToToggle: string) {
    Object.keys(timers).forEach((key) => {
      const timer = timers[key]

      if (key === keyToToggle && !timer.lastStarted) startTimer(key)
      else if (timer.lastStarted) stopTimer(key)
    })
  }

  function newTimer(initialValues?: Pick<Timer, "task" | "project">): string {
    // Stop any currently running timers
    Object.entries(timers).forEach(([key, timer]) => {
      if (timer.lastStarted) stopTimer(key)
    })

    const newTimer: Timer = {
      lastStarted: dayjs(),
      accumulatedSeconds: 0,
      task: initialValues?.task ?? null,
      project: initialValues?.project ?? null,
      summary: ""
    }

    const newTimerKey = crypto.randomUUID()

    setTimers((timers) => {
      const updatedTimers = {...timers}
      updatedTimers[newTimerKey] = newTimer
      return updatedTimers
    })

    return newTimerKey
  }

  async function submitTimer(key: string) {
    const timer = timers[key]

    if (!timer.project) {
      throw new Error("Timer not found")
    }

    await session.timeEntry.insert({
      _id: crypto.randomUUID(),
      task: timer.task,
      project: timer.project,
      organization: currentUser.organization,
      user: currentUser._id,
      summary: timer.summary,
      durationMilliseconds: dayjs
        .duration(getTimerSeconds(timer), "second")
        .asMilliseconds(),
      date: dateToISO(new Date()),
      taskSummary: undefined,
      projectName: undefined,
      organizationName: undefined,
      userName: undefined
    })

    removeTimer(key)
  }

  function getTimerForTask(taskId: string): string | null {
    const timer = Object.keys(timers).find((key) => timers[key].task === taskId)
    return timer ?? null
  }

  return {
    timers,
    removeTimer,
    updateTimer,
    toggleTimer,
    newTimer,
    submitTimer,
    getTimerForTask
  }
}
