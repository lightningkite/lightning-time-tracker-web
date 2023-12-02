import {Slider} from "@mui/material"
import {type FC} from "react"

export const PrioritySlider: FC<{
  value: number
  onChange: (val: number) => void
}> = ({value, onChange}) => {
  return (
    <Slider
      sx={{width: "85%", alignSelf: "center"}}
      onChange={(_, val) => onChange(Array.isArray(val) ? val[0] : val)}
      value={value}
      marks={[
        {value: 0.0, label: "Low Priority"},
        {value: 1.0, label: "High Priority"}
      ]}
      min={0.0}
      max={1.0}
      step={0.1}
      aria-labelledby="score-slider"
      valueLabelDisplay="auto"
    />
  )
}
