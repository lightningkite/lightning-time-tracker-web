import {useThrottle} from "@lightningkite/mui-lightning-components"
import {Box, colors, Radio, Slider} from "@mui/material"
import React, {FC, useEffect, useState} from "react"
import {WebPreferences} from "./Settings"

export interface ColorPickerProps {
  preferences: WebPreferences
  updatePreferences: (newPreferences: Partial<WebPreferences>) => void
}

export const ColorPicker: FC<ColorPickerProps> = (props) => {
  const {preferences, updatePreferences} = props

  const [values, setValues] = useState({
    color: preferences.color,
    colorBrightness: preferences.colorBrightness
  })

  const throttledValues = useThrottle(values, 1000)

  useEffect(() => {
    ;(preferences.color !== throttledValues.color ||
      preferences.colorBrightness !== throttledValues.colorBrightness) &&
      updatePreferences(throttledValues)
  }, [throttledValues])

  return (
    <Box>
      {Object.entries(colors)
        .filter((e) => e[0] !== "common")
        .map(([name, color]) => (
          <Radio
            key={name}
            checked={values.color === name}
            onChange={() => setValues((prev) => ({...prev, color: name}))}
            sx={{
              mb: 3,
              color: (color as any)[800],
              "&.Mui-checked": {
                color: (color as any)[600]
              }
            }}
          />
        ))}

      <Slider
        value={values.colorBrightness}
        onChange={(_e, value) =>
          setValues((prev) => ({...prev, colorBrightness: value as number}))
        }
        valueLabelDisplay="auto"
        step={100}
        marks
        min={100}
        max={900}
      />
    </Box>
  )
}
