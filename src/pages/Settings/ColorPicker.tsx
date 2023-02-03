import {Box, colors, Radio} from "@mui/material"
import React, {FC, useContext} from "react"
import {AuthContext} from "utils/context"

export const ColorPicker: FC = () => {
  const {color: currentColor, setColor} = useContext(AuthContext)
  console.log(Object.entries(colors))

  return (
    <Box>
      {Object.entries(colors)
        .filter((e) => e[0] !== "common")
        .map(([name, color]) => (
          <Radio
            key={name}
            checked={currentColor === name}
            onChange={() => setColor(name)}
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
