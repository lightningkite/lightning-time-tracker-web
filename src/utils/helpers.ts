import dayjs from "dayjs"
import {Timer} from "./context"

export function camelCaseToTitleCase(str: string) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

/**
 * Converts a Date to an ISO string.
 * This function corrects for timezones. Do not use `date.toISOString()`.
 */
export function dateToISO(date: Date, includeTime: boolean = false): string {
  const isoString = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).toISOString()

  return includeTime ? isoString : isoString.split("T")[0]
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
