import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Container, FormControlLabel, Switch} from "@mui/material"
import PageHeader from "components/PageHeader"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react";
import React, { useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {camelCaseToTitleCase} from "utils/helpers"
import {AddUserButton} from "./AddUserButton"

export const UserIndex: FC = () => {
  const navigate = useNavigate()
  const {session} = useContext(AuthContext)
  const permissions = usePermissions()

  const [showInactive, setShowInactive] = useState(false)

  return (
    <Container maxWidth="md">
      <PageHeader title="Users List">
        {permissions.canManageAllUsers && (
          <AddUserButton
            afterSubmit={(newUser) => navigate(`/users/${newUser._id}`)}
          />
        )}

        <FormControlLabel
          control={
            <Switch
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
          }
          label="Show Inactive Users"
          sx={{ml: 2}}
        />
      </PageHeader>

      <RestDataTable
        restEndpoint={session.user}
        onRowClick={(user) => navigate(`/users/${user._id}`)}
        searchFields={["name", "email"]}
        dependencies={[showInactive]}
        defaultSorting={[{field: "name", sort: "asc"}]}
        additionalQueryConditions={
          showInactive ? [] : [{active: {Equal: true}}]
        }
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
            field: "userPermissions",
            headerName: "Role",
            width: 200,
            sortable: false,
            renderCell: ({row}) =>
              row.isSuperUser
                ? "Super User"
                : row.role
                ? camelCaseToTitleCase(row.role)
                : "None"
          },
          ...(showInactive
            ? [
                {
                  field: "active",
                  headerName: "Active",
                  width: 80,
                  type: "boolean"
                }
              ]
            : [])
        ]}
      />
    </Container>
  )
}
