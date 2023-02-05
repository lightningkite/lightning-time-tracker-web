import {Menu} from "@mui/icons-material"
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
import {NavigationDrawer, SIDEBAR_WIDTH} from "./NavigationDrawer"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

const MainLayout: FC<{children: ReactNode}> = ({children}) => {
  const {currentOrganization} = useContext(AuthContext)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [open, setOpen] = useState(!isMobile)

  function toggleOpen() {
    setOpen((prev) => !prev)
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
              aria-label="open drawer"
              onClick={toggleOpen}
              edge="start"
              sx={{mr: 2}}
            >
              <Menu />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            {currentOrganization.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <NavigationDrawer open={open} setOpen={setOpen} isMobile={isMobile} />
      <Box
        pt={3}
        pb={7}
        pl={isMobile ? undefined : SIDEBAR_WIDTH}
        minHeight="100vh"
      >
        <Toolbar />

        {children}
      </Box>
    </>
  )
}

export default MainLayout
