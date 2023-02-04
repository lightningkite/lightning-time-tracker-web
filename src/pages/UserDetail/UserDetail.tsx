import {Card, CardContent, Container} from "@mui/material"
import {User} from "api/sdk"
import ErrorAlert from "components/ErrorAlert"
import Loading from "components/Loading"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import {AuthContext} from "utils/context"
import {UserForm} from "../../components/UserForm"
import {DeleteUserButton} from "./DeleteUserButton"

const UserDetail: FC = () => {
  const {userId} = useParams()
  const {session} = useContext(AuthContext)

  const [user, setUser] = useState<User | null>()

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
        title={user.email}
        breadcrumbs={[
          ["All Users", "/users"],
          [user.email, ""]
        ]}
      >
        <DeleteUserButton user={user} />
      </PageHeader>

      <Card>
        <CardContent sx={{mt: 2}}>
          <UserForm user={user} setUser={setUser} />
        </CardContent>
      </Card>
    </Container>
  )
}

export default UserDetail
