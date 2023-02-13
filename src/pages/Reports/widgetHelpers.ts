import dayjs, {Dayjs} from "dayjs"

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

const holidaysThisYear: Dayjs[] = [
  dayjs().month(0).date(1), // New Years Day
  nthWeekdayOfMonth(dayjs().month(4), Weekday.Monday, -1), // Memorial Day (Last Monday in May)
  dayjs().month(6).date(4), // July 4
  dayjs().month(6).date(24), // July 24
  nthWeekdayOfMonth(dayjs().month(8), Weekday.Monday, 1), // Labor Day (First Monday in Sep)
  nthWeekdayOfMonth(dayjs().month(10), Weekday.Thursday, 4), // Thanksgiving
  nthWeekdayOfMonth(dayjs().month(10), Weekday.Thursday, 4).add(1, "day"), // Day After Thanksgiving
  dayjs().month(11).date(24), // Christmas Eve
  dayjs().month(11).date(25) // Christmas Day
]

function isBillableDayThisYear(date: Dayjs): boolean {
  if (date.day() === Weekday.Saturday || date.day() === Weekday.Sunday) {
    return false
  }

  if (holidaysThisYear.some((holiday) => holiday.isSame(date, "day"))) {
    return false
  }

  if (date.isAfter(dayjs().month(11).date(25))) {
    return false
  }

  return true
}

export function projectedRevenue(
  revenueToDate: number,
  isCurrentMonth: boolean
): number {
  if (!isCurrentMonth) {
    return revenueToDate
  }

  let billableDaysSoFar = 0
  let billableDaysInMonth = 0

  const today = dayjs()
  const daysSoFar = today.date()
  const daysInMonth = today.daysInMonth()

  for (let i = 1; i <= daysInMonth; i++) {
		const isBillable = isBillableDayThisYear(today.date(i))
		const hasPast = i <= daysSoFar
		
		isBillable && billableDaysInMonth++
		isBillable && hasPast && billableDaysSoFar++
  }

  return revenueToDate * (billableDaysInMonth / billableDaysSoFar)
}
