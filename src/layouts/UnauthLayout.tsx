import {Card, CardContent, Container, Stack} from "@mui/material"
import React, {FC, ReactNode} from "react"

const UnauthLayout: FC<{children: ReactNode}> = ({children}) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="space-evenly"
      sx={{height: "100vh"}}
    >
      <Container maxWidth="xs">
        <Card>
          <CardContent sx={{maxHeight: "80vh", overflowY: "auto"}}>
            {children}
          </CardContent>
        </Card>
      </Container>
    </Stack>
  )
}

export default UnauthLayout
