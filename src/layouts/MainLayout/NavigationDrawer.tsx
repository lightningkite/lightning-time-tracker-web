import {
  AccessTime,
  AccountTree,
  Dashboard,
  Insights,
  People,
  Settings
} from "@mui/icons-material"
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip
} from "@mui/material"
import React, {FC} from "react"
import {useLocation, useNavigate} from "react-router-dom"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

const navItems: NavItem[] = [
  {label: "Dashboard", to: "/", icon: Dashboard},
  {label: "My Time", to: "/my-time", icon: AccessTime},
  {label: "Projects", to: "/projects", icon: AccountTree},
  {label: "Reports", to: "/reports", icon: Insights},
  {label: "Users", to: "/users", icon: People},
  {label: "Settings", to: "/settings", icon: Settings}
]

export const NAVIGATION_DRAWER_WIDTH = "4rem"

export const NavigationDrawer: FC<{
  open: boolean
  toggleOpen: () => void
  isMobile: boolean
}> = ({open, toggleOpen, isMobile}) => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={!isMobile || open}
      onClose={toggleOpen}
    >
      <Toolbar sx={{width: isMobile ? undefined : NAVIGATION_DRAWER_WIDTH}} />

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
                onClick={() => {
                  navigate(to)
                  toggleOpen()
                }}
                selected={location.pathname.split("/")[1] === to.split("/")[1]}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center"
                  }}
                >
                  <Icon />
                </ListItemIcon>

                {isMobile && <ListItemText sx={{ml: 2}}>{label}</ListItemText>}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}
