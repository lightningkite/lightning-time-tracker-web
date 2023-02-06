import {Box, colors, Radio} from "@mui/material"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

export const ColorPicker: FC = () => {
  const {applicationSettings, updateApplicationSettings} = useContext(AuthContext)

  return (
    <Box>
      {Object.entries(colors)
        .filter((e) => e[0] !== "common")
        .map(([name, color]) => (
          <Radio
            key={name}
            checked={applicationSettings.color === name}
            onChange={() => updateApplicationSettings({color: name})}
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
