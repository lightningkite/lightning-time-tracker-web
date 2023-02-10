import {useRef} from "react"

export const useFocus = (): [any, () => void] => {
  const htmlElRef = useRef<HTMLElement | null>(null)

  const setFocus = () => {
    console.log(htmlElRef.current)
    htmlElRef.current?.focus()
  }

  return [htmlElRef, setFocus]
}
