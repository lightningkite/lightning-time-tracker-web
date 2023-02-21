import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Card, CardContent, Container, Paper, Tab} from "@mui/material"
import {User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {UserForm} from "../../components/UserForm"
import {DeleteUserButton} from "./DeleteUserButton"
import {TaskTab} from "./TaskTab"
import {TimeEntryTab} from "./TimeEntryTab"

const UserDetail: FC = () => {
  const {userId} = useParams()
  const {session} = useContext(AuthContext)

  const [user, setUser] = useState<User | null>()
  const [tab, setTab] = useState("1")

  useEffect(() => {
    session.user
      .detail(userId as string)
      .then(setUser)
      .catch(() => setUser(null))
  }, [userId])

  if (user === undefined) {
    return <Loading />
  }

  if (user === null) {
    return <ErrorAlert>Error loading user</ErrorAlert>
  }

  return (
    <Container maxWidth="md">
      <PageHeader
        title={user.name || user.email}
        breadcrumbs={[
          ["All Users", "/users"],
          [user.name || user.email, ""]
        ]}
      >
        <DeleteUserButton user={user} />
      </PageHeader>

      <Card>
        <CardContent sx={{mt: 2}}>
          <UserForm user={user} setUser={setUser} />
        </CardContent>
      </Card>

      <TabContext value={tab}>
        <Paper sx={{mt: 4, mb: 1}}>
          <TabList onChange={(_e, v) => setTab(v as string)}>
            <Tab label="Tasks" value="1" />
            <Tab label="Time Entries" value="2" />
          </TabList>
        </Paper>

        <TabPanel value="1" sx={{p: 0}}>
          <TaskTab user={user} />
        </TabPanel>
        <TabPanel value="2" sx={{p: 0}}>
          <TimeEntryTab user={user} />
        </TabPanel>
      </TabContext>
    </Container>
  )
}

export default UserDetail
