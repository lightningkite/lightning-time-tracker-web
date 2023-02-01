export function camelCaseToTitleCase(str: string) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase()
  })
}

/**
 * Converts a Date to an ISO string without the time component.
 * This function correctly ignores timezones. Do not use `date.toISOString()`.
 */
export const dateToISO = (date: Date): string => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0]
}

/**
 * Converts an ISO string to a Date without the time component.
 * This function correctly ignores timezones. Do not use `new Date(dateString)`.
 */
export const dateFromISO = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-")
  return new Date(Number(year), Number(month) - 1, Number(day))
}
