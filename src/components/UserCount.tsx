import {Typography} from "@mui/material"
import type {FC} from "react"

export const UserCount: FC<{
  userNames: string[]
  count: number
}> = ({userNames, count}) => {
  return (
    <>
      {userNames
        .filter((_, index) => index <= count - 1)
        .map((username, index) => (
          <Typography variant="body2" color="text.secondary" key={index}>
            &#x2022;&nbsp; {username}
          </Typography>
        ))}
      <Typography variant="body2" color="text.secondary">
        {userNames.length > count ? ` +  ${userNames.length - count}` : ""}
      </Typography>
    </>
  )
}
