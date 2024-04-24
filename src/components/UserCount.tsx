import {Typography} from "@mui/material"
import type {FC} from "react"

export const UserCount: FC<{
  userName: string
  count: number
}> = ({userName, count}) => {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        &#x2022;&nbsp; {userName} {count > 0 ? `+ ${count}` : ""}
      </Typography>
    </>
  )
}
