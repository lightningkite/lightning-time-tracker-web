import {Task, TaskState} from "api/sdk"
import dayjs from "dayjs"
import {Timer} from "./context"

import duration, {Duration} from "dayjs/plugin/duration"
dayjs.extend(duration)

export function camelCaseToTitleCase(str: string) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

/**
 * Converts a Date to an ISO string.
 * This function corrects for timezones. Do not use `date.toISOString()`.
 */
export function dateToISO(date: Date): string {
  const isoString = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString()

  return isoString.split("T")[0]
}

/**
 * Converts an ISO string to a Date.
 * This function corrects for timezones. Do not use `new Date(dateString)`.
 */
export function dateFromISO(dateString: string): Date {
  if (dateString.includes("T")) {
    return new Date(dateString)
  } else {
    const [year, month, day] = dateString.split("-")
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
}

export function getTimerSeconds(timer: Timer): number {
  const elapsedSeconds = timer.lastStarted
    ? dayjs().diff(dayjs(timer.lastStarted), "second")
    : 0

  return elapsedSeconds + timer.accumulatedSeconds
}

const taskStateOrder: Record<TaskState, number> = {
  [TaskState.Hold]: 0,
  [TaskState.Active]: 1,
  [TaskState.Completed]: 2,
  [TaskState.Tested]: 3,
  [TaskState.Done]: 4
}

export function compareTasks(a: Task, b: Task): number {
  return taskStateOrder[a.state] - taskStateOrder[b.state]
}

export function stringToDuration(durationString: string): Duration | null {
  if (!durationString) return null

  const splitNumbers = durationString.split(":").map(Number)
  if (splitNumbers.length > 3 || splitNumbers.some((n) => isNaN(n))) return null

  const seconds = splitNumbers.at(-1) ?? 0
  const minutes = splitNumbers.at(-2) ?? 0
  const hours = splitNumbers.at(-3) ?? 0

  if (minutes > 59 || seconds > 59) return null
  if (hours < 0 || minutes < 0 || seconds < 0) return null

  return dayjs.duration({hours, minutes, seconds})
}
