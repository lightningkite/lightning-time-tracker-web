import {HoverHelp} from "@lightningkite/mui-lightning-components"
import {Close, Menu, TimerOutlined} from "@mui/icons-material"
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
import {usePermissions} from "hooks/usePermissions"
import React, {FC, ReactNode, useContext, useState} from "react"
import {theme} from "theme"
import {AuthContext, TimerContext} from "utils/context"
import {NAVIGATION_DRAWER_WIDTH, NavigationDrawer} from "./NavigationDrawer"
import {SummaryTime} from "./SummaryTime"
import {TIMER_DRAWER_WIDTH, TimerDrawer} from "./TimerDrawer"

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
  const permissions = usePermissions()

  const [openNavigation, setOpenNavigation] = useState(!isMobile)
  const [openTimers, setOpenTimers] = useState(false)

  // const isInitialRenders = useRef(true)

  // useEffect(() => {
  //   if (!openTimers && !isInitialRenders.current) {
  //     setOpenTimers(true)
  //   }

  //   isInitialRenders.current &&
  //     setTimeout(() => (isInitialRenders.current = false), 2000)
  // }, [timers])

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

          {permissions.canSubmitTime && (
            <Stack direction="row" alignItems="center" spacing={1} ml="auto">
              <SummaryTime />

              <HoverHelp
                description={openTimers ? "Hide timers" : "Show timers"}
              >
                <IconButton
                  color="inherit"
                  onClick={toggleOpenTimers}
                  edge="start"
                >
                  <Badge
                    badgeContent={openTimers || !timers ? null : timers.length}
                    color="primary"
                  >
                    {!openTimers ? <TimerOutlined /> : <Close />}
                  </Badge>
                </IconButton>
              </HoverHelp>
            </Stack>
          )}
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
