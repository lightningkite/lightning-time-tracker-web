import {Condition} from "@lightningkite/lightning-server-simplified"
import {Task, TaskState, TimeEntry, Timer, User, UserRole} from "api/sdk"
import dayjs, {Dayjs} from "dayjs"
import duration, {Duration} from "dayjs/plugin/duration"
import {WebPreferences} from "pages/Settings/Settings"

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
  [TaskState.PullRequest]: 1.5,
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
    themeColor: "#90D1FF",
    summaryTime: "week"
  }
  try {
    const parsed = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      preferencesJSON || "{}"
    ) as Partial<WebPreferences> // Probably

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

export const taskStateLabels: Record<TaskState, string> = {
  [TaskState.Cancelled]: "Cancelled",
  [TaskState.Hold]: "On Hold",
  [TaskState.Active]: "Active",
  [TaskState.PullRequest]: "Pull Request",
  [TaskState.Testing]: "Testing",
  [TaskState.Approved]: "Customer Review",
  [TaskState.Delivered]: "Delivered"
}

export function getNameInitials(name: string): string {
  const split = name.split(" ")
  const first = split.at(0)
  const last = split.at(-1)

  return `${first?.charAt(0) ?? ""}${last?.charAt(0) ?? ""}`.toUpperCase()
}

export function getContrastingColor(hex: string): "black" | "white" {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)

  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "black" : "white"
}

export function makeUserTaskCondition(params: {
  project: string
  organization: string
}): Condition<User> {
  return {
    Or: [
      {isSuperUser: {Equal: true}},
      {
        And: [
          {active: {Equal: true}},
          {organization: {Equal: params.organization}},
          {role: {IfNotNull: {NotInside: [UserRole.Client]}}},
          {
            Or: [
              {
                role: {
                  IfNotNull: {
                    Inside: [UserRole.Owner, UserRole.InternalTeamMember]
                  }
                }
              },
              {
                limitToProjects: {
                  IfNotNull: {SetAnyElements: {Equal: params.project}}
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

export function makeUserTimeCondition(params: {
  project: string | undefined
  organization: string
}): Condition<User> {
  return {
    Or: [
      {isSuperUser: {Equal: true}},
      {
        And: [
          {active: {Equal: true}},
          {organization: {Equal: params.organization}},
          {
            role: {
              IfNotNull: {
                NotInside: [UserRole.Client, UserRole.ExternalTeamMember]
              }
            }
          },
          {
            Or: [
              {
                role: {
                  IfNotNull: {
                    Inside: [UserRole.Owner, UserRole.InternalTeamMember]
                  }
                }
              },
              {
                limitToProjects: params.project
                  ? {IfNotNull: {SetAnyElements: {Equal: params.project}}}
                  : {Always: true}
              }
            ]
          }
        ]
      }
    ]
  }
}
