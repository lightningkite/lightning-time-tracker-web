import {Box, colors, Radio} from "@mui/material"
import React, {FC} from "react"
import {WebPreferences} from "./Settings"

export interface ColorPickerProps {
  preferences: WebPreferences
  updatePreferences: (newPreferences: WebPreferences) => void
}

export const ColorPicker: FC<ColorPickerProps> = (props) => {
  const {preferences, updatePreferences} = props

  return (
    <Box>
      {Object.entries(colors)
        .filter((e) => e[0] !== "common")
        .map(([name, color]) => (
          <Radio
            key={name}
            checked={preferences.color === name}
            onChange={() => updatePreferences({color: name})}
            sx={{
              color: (color as any)[800],
              "&.Mui-checked": {
                color: (color as any)[600]
              }
            }}
          />
        ))}
    </Box>
  )
}
