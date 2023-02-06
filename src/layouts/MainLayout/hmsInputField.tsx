import {TextField} from "@mui/material"
import React, {FC, useEffect, useState} from "react"

const HmsInputField: FC<{
  value: number
  onChange: (value: number) => void
  handlePause: () => void
}> = (props) => {
  const {onChange, handlePause} = props

  const [stringValue, setStringValue] = useState(
    props.value.toString().padStart(2, "0")
  )

  useEffect(
    () => setStringValue(props.value.toString().padStart(2, "0")),
    [props.value]
  )

  return (
    <TextField
      type="number"
      value={stringValue}
      placeholder="--"
      onBlur={(v) => {
        const n = Number(v.currentTarget.value)
        onChange(isNaN(n) ? 0 : n)
      }}
      onFocus={() => handlePause()}
      onChange={(v) => {
        setStringValue(v.currentTarget.value)
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
