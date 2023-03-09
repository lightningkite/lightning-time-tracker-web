import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AddUserButton} from "./AddUserButton"

export const UserIndex: FC = () => {
  const navigate = useNavigate()
  const {session, currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <Container maxWidth="md">
      <PageHeader title="Users List">
        {currentUser.isSuperUser && (
          <AddUserButton
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </PageHeader>

      <RestDataTable
        restEndpoint={session.user}
        onRowClick={(user) => navigate(`/users/${user._id}`)}
        searchFields={["name", "email"]}
        dependencies={[refreshTrigger]}
        columns={[
          {
            field: "name",
            headerName: "Name",
            flex: 1,
            maxWidth: 200
          },
          {
            field: "email",
            headerName: "Email",
            flex: 1
          },
          {
            field: "isClient",
            headerName: "Client",
            type: "boolean"
          },
          {
            field: "isSuperUser",
            headerName: "Super User",
            width: 120,
            type: "boolean"
          }
        ]}
      />
    </Container>
  )
}
