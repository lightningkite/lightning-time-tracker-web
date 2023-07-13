import type {RefObject} from "react"
import {useRef} from "react"

export const useFocus = (): [RefObject<HTMLElement | null>, () => void] => {
  const htmlElRef = useRef<HTMLElement | null>(null)

  const setFocus = () => {
    htmlElRef.current?.focus()
  }

  return [htmlElRef, setFocus]
}
