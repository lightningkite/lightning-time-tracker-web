import {Container} from "@mui/material"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"

dayjs.extend(duration)

export const MyTimeEntries: FC = () => {
  const {currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <Container maxWidth="lg">
      <PageHeader title="My Time Entries">
        <AddTimeEntryButton
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          user={currentUser}
        />
      </PageHeader>

      <TimeEntryTable
        additionalQueryConditions={[{user: {Equal: currentUser._id}}]}
        hiddenColumns={["userName"]}
        dependencies={[refreshTrigger]}
      />
    </Container>
  )
}
