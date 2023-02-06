import {Menu, Timer, TimerOutlined} from "@mui/icons-material"
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material"
import React, {FC, ReactNode, useContext, useState} from "react"
import {theme} from "theme"
import {AuthContext, TimerContext} from "utils/context"
import {NavigationDrawer, NAVIGATION_DRAWER_WIDTH} from "./NavigationDrawer"
import {SummaryTime} from "./SummaryTime"
import {TimerDrawer, TIMER_DRAWER_WIDTH} from "./TimerDrawer"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

const MainLayout: FC<{children: ReactNode}> = ({children}) => {
  const {currentOrganization} = useContext(AuthContext)
  const {timers} = useContext(TimerContext)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [openNavigation, setOpenNavigation] = useState(!isMobile)
  const [openTimers, setOpenTimers] = useState(false)

  function toggleOpenNavigation() {
    isMobile && setOpenTimers(false)
    setOpenNavigation((prev) => !prev)
  }

  function toggleOpenTimers() {
    setOpenNavigation(false)
    setOpenTimers((prev) => !prev)
  }

  return (
    <>
      <AppBar
        position="fixed"
        sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={toggleOpenNavigation}
              edge="start"
              sx={{mr: 2}}
            >
              <Menu />
            </IconButton>
          )}

          <Typography variant="h6" noWrap component="div">
            {currentOrganization.name}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} ml="auto">
            <SummaryTime />

            <IconButton color="inherit" onClick={toggleOpenTimers} edge="start">
              <Badge badgeContent={Object.keys(timers).length} color="primary">
                {openTimers ? <Timer /> : <TimerOutlined />}
              </Badge>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <NavigationDrawer
        open={openNavigation}
        toggleOpen={toggleOpenNavigation}
        isMobile={isMobile}
      />

      <TimerDrawer
        open={openTimers}
        toggleOpen={toggleOpenTimers}
        isMobile={isMobile}
      />
      <Box
        pt={3}
        pb={7}
        pl={isMobile ? undefined : NAVIGATION_DRAWER_WIDTH}
        pr={isMobile || !openTimers ? undefined : TIMER_DRAWER_WIDTH}
        minHeight="100vh"
        sx={{
          // Transition paddingRight
          transition: (theme) =>
            theme.transitions.create("padding-right", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen
            })
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </>
  )
}

export default MainLayout
