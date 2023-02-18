import {RestDataTable} from "@lightningkite/mui-lightning-components"
import {Container} from "@mui/material"
import {useAnnotatedEndpoint} from "api/AnnotatedEndpoints"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC, useContext, useState} from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "utils/context"
import {AddProjectButton} from "./AddProjectButton"

export const ProjectIndex: FC = () => {
  const navigate = useNavigate()
  const {session, currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const newEndpoint = useAnnotatedEndpoint({
    collection: "organization",
    with: ["owner"]
  })

  const testEndpoint = useAnnotatedEndpoint({
    collection: "user",
    with: ["organization"],
    include: {
      timeEntry: {
        condition: {Always: true},
        relationProperty: "user"
      }
    }
  })

  ;(async () => {
    const val = await newEndpoint.detail("123")
    const val2 = await testEndpoint.detail("123")

    console.log(val._annotations.owner, val2._annotations.timeEntries)
  })()

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
            field: "createdAt",
            headerName: "Created",
            width: 130,
            type: "date",
            valueFormatter: ({value}) => dayjs(value).format("MMM D, YYYY")
          },
          {
            field: "rate",
            headerName: "Rate",
            width: 80,
            type: "number",
            valueFormatter: ({value}) => `$${(value as number | null) ?? 0}`
          }
        ]}
      />
    </Container>
  )
}
