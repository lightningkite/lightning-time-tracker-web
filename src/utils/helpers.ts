import {Task, TaskState, TimeEntry} from "api/sdk"
import dayjs, {Dayjs} from "dayjs"
import duration, {Duration} from "dayjs/plugin/duration"
import {WebPreferences} from "pages/Settings/Settings"
import {Timer} from "./context"

dayjs.extend(duration)

export const MILLISECONDS_PER_HOUR = 1000 * 60 * 60

export function formatDollars(amount: number, includeCents: boolean = true) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencySign: "accounting",
    maximumFractionDigits: includeCents ? 2 : 0
  }).format(amount)
}

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
  [TaskState.Testing]: 2,
  [TaskState.Approved]: 3,
  [TaskState.Delivered]: 4,
  [TaskState.Cancelled]: 5
}

export function compareTasksByState(a: Task, b: Task): number {
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

export function totalHoursForTimeEntries(timeEntries: TimeEntry[]): number {
  return timeEntries.reduce((acc, timeEntry) => {
    const milliseconds = timeEntry.durationMilliseconds
    const hours = milliseconds / MILLISECONDS_PER_HOUR
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return acc + hours
  }, 0)
}

export function parsePreferences(
  preferencesJSON: string | null | undefined
): WebPreferences {
  const defaultPreferences: WebPreferences = {
    mode: "dark",
    color: "lightBlue",
    colorBrightness: 500,
    summaryTime: "week"
  }
  try {
    const parsed = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      preferencesJSON || "{}"
    ) as Partial<WebPreferences> // Probably

    const isValidBrightness =
      !!parsed.colorBrightness &&
      [100, 200, 300, 400, 500, 600, 700, 800, 900].includes(
        parsed.colorBrightness
      )

    if (!isValidBrightness) {
      delete parsed.colorBrightness
    }

    return {...defaultPreferences, ...parsed}
  } catch (e) {
    console.error("Error parsing preferences", e)
  }

  return defaultPreferences
}

export function booleanCompare<T>(
  a: T,
  b: T,
  key: (item: T) => boolean
): number {
  const aKey = key(a)
  const bKey = key(b)

  if (aKey === bKey) return 0
  if (aKey) return -1
  return 1
}

// Should use this instead of `dayjs.duration().format()` because what if the hours are more than 24?
export function formatLongDuration(duration: Duration): string {
  const justHours = Math.floor(duration.asHours())

  return `${justHours} : ${duration.format("mm : ss")}`
}

export function dynamicFormatDate(date: Dayjs): string {
  const now = dayjs()
  const yesterday = now.subtract(1, "day")
  const isToday = now.isSame(date, "day")
  const isYesterday = yesterday.isSame(date, "day")

  if (isToday) return "Today"
  if (isYesterday) return "Yesterday"

  if (now.year() === date.year() || now.diff(date, "month") < 9)
    return date.format("MMM D")

  return date.format("YYYY-MM-DD")
}

export async function uploadToS3(uploadUrl: string, file: File) {
  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-type": file.type
    }
  }).then((res) => {
    if (!res.ok) {
      console.log("Error uploading file", res)
      throw new Error("Error uploading file")
    }
  })
}
