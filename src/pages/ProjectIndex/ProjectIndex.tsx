import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AddProjectButton} from "./AddProjectButton"

export const ProjectIndex: FC = () => {
  const navigate = useNavigate()
  const {session, currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <Container maxWidth="md">
      <PageHeader title="Projects">
        {currentUser.isSuperUser && (
          <AddProjectButton
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
      </PageHeader>

      <RestDataTable
        restEndpoint={session.project}
        onRowClick={(project) => navigate(`/projects/${project._id}`)}
        searchFields={["name"]}
        dependencies={[refreshTrigger]}
        columns={[
          {field: "name", headerName: "Name", flex: 1},
          {
            field: "rate",
            headerName: "Rate",
            width: 120,
            type: "number",
            valueFormatter: ({value}) => `$${value as number}`
          }
        ]}
      />
    </Container>
  )
}
