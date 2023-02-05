import {Menu, Timer, TimerOutlined} from "@mui/icons-material"
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material"
import React, {FC, ReactNode, useContext, useState} from "react"
import {theme} from "theme"
import {AuthContext} from "utils/context"
import {NavigationDrawer, NAVIGATION_DRAWER_WIDTH} from "./NavigationDrawer"
import {TimerDrawer, TIMER_DRAWER_WIDTH} from "./TimerDrawer"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

const MainLayout: FC<{children: ReactNode}> = ({children}) => {
  const {currentOrganization} = useContext(AuthContext)
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

          {/* {isMobile && ( */}
          <IconButton
            color="inherit"
            onClick={toggleOpenTimers}
            edge="start"
            sx={{ml: "auto"}}
          >
            {openTimers ? <Timer /> : <TimerOutlined />}
          </IconButton>
          {/* )} */}
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
