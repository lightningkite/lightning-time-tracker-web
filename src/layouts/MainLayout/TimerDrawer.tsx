import {Drawer, Toolbar} from "@mui/material"
import React, {FC} from "react"

export const TIMER_DRAWER_WIDTH = "25rem"

export const TimerDrawer: FC<{
  open: boolean
  toggleOpen: () => void
  isMobile: boolean
}> = ({open, toggleOpen, isMobile}) => {
  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      // variant="temporary"
      anchor="right"
      // open={!isMobile || open}
      open={open}
      onClose={toggleOpen}
    >
      <Toolbar sx={{width: isMobile ? '100vw' : TIMER_DRAWER_WIDTH}} />
    </Drawer>
  )
}
