export const useQueryParams = (): Record<string, string | undefined> => {
  const params = new URLSearchParams(window.location.search)

  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}
