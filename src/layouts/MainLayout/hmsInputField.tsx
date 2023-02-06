import {TextField} from "@mui/material"
import React, {FC} from "react"

const HmsInputField: FC<{
  value: number
  onChange: (value: number) => void
  handlePause: () => void
}> = ({value, onChange, handlePause}) => {
  const [hasFocus, setHasFocus] = React.useState(false)

  return (
    <TextField
      type="number"
      value={value}
      // formatter={(value) =>
      //   value && !hasFocus ? value.padStart(2, "0") : value
      // }
      placeholder="--"
      onBlur={(v) => {
        setHasFocus(false)
        onChange(Number(v.currentTarget.value) || 0)
      }}
      onFocus={() => {
        setHasFocus(true)
        handlePause()
      }}
      // Hide the up/down arrows
      sx={{
        width: 50,
        textAlign: "center",
        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
          {
            "-webkit-appearance": "none",
            margin: 0
          },
        "& input[type=number]": {
          "-moz-appearance": "textfield"
        }
      }}
    />
  )
}

export default HmsInputField
