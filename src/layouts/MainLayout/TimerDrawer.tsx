import {MoreTime} from "@mui/icons-material"
import {Box, Button, Drawer, Stack, Toolbar, Typography} from "@mui/material"
import type {Project} from "api/sdk"
import Loading from "components/Loading"
import {TimerItem} from "components/TimerItem"
import type {FC} from "react";
import React, { useContext, useEffect, useState} from "react"
import {AuthContext, TimerContext} from "utils/context"

export const TIMER_DRAWER_WIDTH = "25rem"

export const TimerDrawer: FC<{
  open: boolean
  toggleOpen: () => void
  isMobile: boolean
}> = ({open, toggleOpen, isMobile}) => {
  const {timers, newTimer} = useContext(TimerContext)
  const {session} = useContext(AuthContext)

  const [projects, setProjects] = useState<Project[]>()

  useEffect(() => {
    session.project
      .query({})
      .then(setProjects)
      .catch(() => alert("Error fetching projects"))
  }, [])

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

        {timers ? (
          <Stack spacing={3} sx={{mt: 3}}>
            {timers.map((timer) => (
              <TimerItem
                key={timer._id}
                timer={timer}
                projectOptions={projects}
              />
            ))}

            <Button
              variant="outlined"
              startIcon={<MoreTime />}
              onClick={() => newTimer()}
            >
              Add Timer
            </Button>
          </Stack>
        ) : (
          <Loading />
        )}
      </Box>
    </Drawer>
  )
}
