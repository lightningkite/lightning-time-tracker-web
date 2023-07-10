import {useThrottle} from "@lightningkite/mui-lightning-components"
import React, {FC, useEffect, useState} from "react"
import {WebPreferences} from "./Settings"

export interface ColorPickerProps {
  preferences: WebPreferences
  updatePreferences: (newPreferences: Partial<WebPreferences>) => void
}

export const ColorPicker: FC<ColorPickerProps> = (props) => {
  const {preferences, updatePreferences} = props

  const [color, setColor] = useState(preferences.themeColor)
  const throttledColor = useThrottle(color, 1000)

  useEffect(() => {
    preferences.themeColor !== throttledColor &&
      updatePreferences({themeColor: throttledColor})
  }, [throttledColor])

  return (
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
    />
  )
}
