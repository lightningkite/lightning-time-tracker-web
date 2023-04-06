import {useEffect, useState} from "react"
import useWindowFocus from "./useWindowFocus"

export default function usePeriodicRefresh(minIntervalSeconds: number): number {
  const windowFocused = useWindowFocus()

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    setRefreshTrigger((prev) => prev + 1)

    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1)
    }, minIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [windowFocused])

  return refreshTrigger
}
