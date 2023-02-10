import {MoreTime} from "@mui/icons-material"
import {Box, Button, Drawer, Stack, Toolbar, Typography} from "@mui/material"
import {TimerItem} from "components/TimerItem"
import React, {FC, useContext} from "react"
import {TimerContext} from "utils/context"

export const TIMER_DRAWER_WIDTH = "25rem"

export const TimerDrawer: FC<{
  open: boolean
  toggleOpen: () => void
  isMobile: boolean
}> = ({open, toggleOpen, isMobile}) => {
  const {timers, newTimer} = useContext(TimerContext)

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="right"
      open={open}
      onClose={toggleOpen}
      keepMounted={true}
      PaperProps={{
        sx: {width: isMobile ? "100vw" : TIMER_DRAWER_WIDTH}
      }}
    >
      <Toolbar />

      <Box p={2}>
        <Typography variant="h2">Timers</Typography>

        <Stack spacing={3} sx={{mt: 3}}>
          {Object.keys(timers).map((timerKey) => (
            <TimerItem key={timerKey} timerKey={timerKey} />
          ))}

          <Button
            variant="outlined"
            startIcon={<MoreTime />}
            onClick={() => newTimer()}
          >
            Add Timer
          </Button>
        </Stack>
      </Box>
    </Drawer>
  )
}
