import {
  Assignment,
  Dashboard,
  Menu,
  People,
  Settings
} from "@mui/icons-material"
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material"
import React, {FC, ReactNode, useContext, useState} from "react"
import {matchPath, useLocation, useNavigate} from "react-router-dom"
import {theme} from "theme"
import {AuthContext} from "utils/context"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

const navItems: NavItem[] = [
  {label: "Dashboard", to: "/", icon: Dashboard},
  {label: "Users", to: "/users", icon: People},
  {label: "Projects", to: "/projects", icon: Assignment},
  {label: "Settings", to: "/settings", icon: Settings}
]

const SIDEBAR_WIDTH = "4rem"

const MainLayout: FC<{children: ReactNode}> = ({children}) => {
  const {currentOrganization} = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [open, setOpen] = useState(isMobile)

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

      <Drawer variant="persistent" anchor="left" open={!isMobile || open}>
        <Toolbar sx={{width: SIDEBAR_WIDTH}} />

        <Divider sx={{my: 2}} />

        <List>
          {navItems.map(({label, to, icon: Icon, show}) => (
            <ListItem key={to} disablePadding sx={{display: "block"}}>
              <Tooltip title={label} placement="right" arrow>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: "center",
                    px: 2.5
                  }}
                  onClick={() => navigate(to)}
                  selected={!!matchPath(location.pathname, to)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center"
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Drawer>
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
