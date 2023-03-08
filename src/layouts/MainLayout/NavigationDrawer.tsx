import {
  AccessTime,
  AccountTree,
  Dashboard,
  Insights,
  People,
  Settings,
  ViewWeek
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
import {usePermissions} from "hooks/usePermissions"
import React, {FC} from "react"
import {useLocation, useNavigate} from "react-router-dom"

export interface NavItem {
  label: string
  to: string
  icon: FC
  show?: boolean
}

export const NAVIGATION_DRAWER_WIDTH = "4rem"

export const NavigationDrawer: FC<{
  open: boolean
  toggleOpen: () => void
  isMobile: boolean
}> = ({open, toggleOpen, isMobile}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const permissions = usePermissions()

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: Dashboard,
      show: permissions.tasks
    },
    {
      label: "Project View",
      to: "/project-view",
      icon: ViewWeek,
      show: permissions.tasks || permissions.readSomeProjects
    },
    {
      label: "My Time",
      to: "/my-time",
      icon: AccessTime,
      show: permissions.timeEntries
    },
    {
      label: "Projects",
      to: "/projects",
      icon: AccountTree,
      show: permissions.readSomeProjects || permissions.manageProjects
    },
    {
      label: "Reports",
      to: "/reports",
      icon: Insights,
      show:
        permissions.readSomeProjects ||
        (permissions.manageTasks && permissions.manageTimeEntries)
    },
    {
      label: "Users",
      to: "/users",
      icon: People,
      show: permissions.manageUsers
    },
    {label: "Settings", to: "/settings", icon: Settings}
  ]

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={!isMobile || open}
      onClose={toggleOpen}
    >
      <Toolbar sx={{width: isMobile ? undefined : NAVIGATION_DRAWER_WIDTH}} />

      <List>
        {navItems
          .filter((n) => n.show !== false)
          .map(({label, to, icon: Icon, show}) => (
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
                  selected={
                    location.pathname.split("/")[1] === to.split("/")[1]
                  }
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: "center"
                    }}
                  >
                    <Icon />
                  </ListItemIcon>

                  {isMobile && (
                    <ListItemText sx={{ml: 2}}>{label}</ListItemText>
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
      </List>
    </Drawer>
  )
}
