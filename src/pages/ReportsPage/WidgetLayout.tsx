import {Paper, Typography} from "@mui/material"
import type {FC, PropsWithChildren} from "react"
import React from "react"

export interface WidgetLayoutProps {
  title: string
}

export const WidgetLayout: FC<PropsWithChildren<WidgetLayoutProps>> = ({
  title,
  children
}) => {
  return (
    <Paper sx={{p: 2, minWidth: "13rem"}}>
      <Typography color="text.secondary" fontWeight="bold">
        {title.toUpperCase()}
      </Typography>
      {children}
    </Paper>
  )
}
