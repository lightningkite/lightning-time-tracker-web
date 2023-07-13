import type { AlertProps} from "@mui/material";
import {Alert} from "@mui/material"
import type {FC} from "react";
import React from "react"

const ErrorAlert: FC<AlertProps> = ({children, sx, ...rest}) => {
  return (
    <Alert variant="filled" severity="error" sx={{m: 3, ...sx}} {...rest}>
      {children}
    </Alert>
  )
}

export default ErrorAlert
