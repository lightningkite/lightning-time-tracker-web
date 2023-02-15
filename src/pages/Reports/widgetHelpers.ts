import dayjs, {Dayjs} from "dayjs"
import {DateRange} from "./DateRangeSelector"

enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}

function nthWeekdayOfMonth(date: Dayjs, weekday: Weekday, nth: number): Dayjs {
  if (nth > 0) {
    const day = date.date(1).day(weekday)
    const offset = nth - 1
    return day.add(offset, "week")
  } else {
    const day = date.date(1).add(1, "month").subtract(1, "day").day(weekday)
    const offset = nth + 1
    return day.add(offset, "week")
  }
}

const cachedHolidaysByYear: Map<number, Dayjs[]> = new Map()

function getHolidaysForYear(year: number): Dayjs[] {
  let holidays = cachedHolidaysByYear.get(year)
  if (holidays) return holidays

  holidays = [
    dayjs().year(year).month(0).date(1), // New Years Day
    nthWeekdayOfMonth(dayjs().year(year).month(4), Weekday.Monday, -1), // Memorial Day (Last Monday in May)
    dayjs().year(year).month(6).date(4), // July 4
    dayjs().year(year).month(6).date(24), // July 24
    nthWeekdayOfMonth(dayjs().year(year).month(8), Weekday.Monday, 1), // Labor Day (First Monday in Sep)
    nthWeekdayOfMonth(dayjs().year(year).month(10), Weekday.Thursday, 4), // Thanksgiving
    nthWeekdayOfMonth(dayjs().year(year).month(10), Weekday.Thursday, 4).add(
      1,
      "day"
    ), // Day After Thanksgiving
    dayjs().year(year).month(11).date(24), // Christmas Eve
    dayjs().year(year).month(11).date(25) // Christmas Day
  ]

  cachedHolidaysByYear.set(year, holidays)
  return holidays
}

function isBillableDay(date: Dayjs): boolean {
  // Weekends
  if (date.day() === Weekday.Saturday || date.day() === Weekday.Sunday) {
    return false
  }

  // Between Christmas and New Years Day
  if (date.month() === 11 && date.date() > 25) {
    return false
  }

  const holidaysForYear = getHolidaysForYear(date.year())

  if (holidaysForYear.some((holiday) => holiday.isSame(date, "day"))) {
    return false
  }

  return true
}

export function projectedRevenue(
  revenueToDate: number,
  dateRange: DateRange
): number {
  if (dateRange.end.isBefore(dayjs(), "day")) {
    return revenueToDate
  }

  let billableDaysSoFar = 0
  let billableDaysInRange = 0

  for (
    let d = dayjs(dateRange.start);
    !d.isAfter(dateRange.end, "day");
    d = d.add(1, "day")
  ) {
    const isBillable = isBillableDay(d)

    isBillable && billableDaysInRange++
    isBillable && d.isBefore(dayjs(), "day") && billableDaysSoFar++
  }

  return revenueToDate * (billableDaysInRange / billableDaysSoFar)
}
