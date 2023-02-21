import {Done} from "@mui/icons-material"
import {IconButton} from "@mui/material"
import {FC} from "react"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"

const TaskStateActionButton: FC<{
  annotatedTask: AnnotatedTask
}> = ({annotatedTask}) => {
  return (
    <IconButton
      onClick={() => console.log("clicked")}
      sx={{color: "text.secondary"}}
    >
      <Done />
    </IconButton>
  )
}
