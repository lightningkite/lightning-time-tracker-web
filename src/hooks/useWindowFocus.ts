import React, {useState} from "react"

export default function useWindowFocus(): boolean {
  const [windowFocus, setWindowFocus] = useState(
    document.hasFocus() && !document.hidden
  )

  React.useEffect(() => {
    const onFocus = () => setWindowFocus(true)
    const onBlur = () => setWindowFocus(false)

    window.addEventListener("focus", onFocus)
    window.addEventListener("blur", onBlur)

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener("blur", onBlur)
    }
  }, [])

  return windowFocus
}
