import {Box, Button, Divider, Stack} from "@mui/material"
import React, {FC, ReactNode} from "react"
import {NavLink} from "react-router-dom"
import MyUserMenu from "./MyUserMenu"

// Define the items that will appear in the sidebar navigation
const navItems: Array<{label: string; to: string}> = [
  {label: "Home", to: "/"},
  {label: "Users", to: "/users"},
  {label: "Formik Input Demo", to: "/input-demo"}
]

const SIDEBAR_WIDTH = "17rem"

const MainLayout: FC<{children: ReactNode}> = ({children}) => {
  return (
    <>
      <Box
        sx={{
          p: 1,
          zIndex: 100,
          backgroundColor: "white",
          width: SIDEBAR_WIDTH,
          boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
          position: "fixed",
          height: "100vh",
          overflowY: "auto"
        }}
      >
        <MyUserMenu />

        <Divider sx={{m: 2}} />

        <Stack spacing={1}>
          {navItems.map(({label, to}) => (
            <Button
              key={to}
              component={NavLink}
              to={to}
              sx={{
                justifyContent: "start",
                "&.active": {
                  bgcolor: "primary.main",
                  color: "white"
                }
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Box>
      <Box
        bgcolor="background.default"
        pt={3}
        pb={7}
        pl={SIDEBAR_WIDTH}
        minHeight="100vh"
      >
        {children}
      </Box>
    </>
  )
}

export default MainLayout
