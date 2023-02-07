import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import dayjs from "dayjs"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {AddTimeEntryButton} from "./AddTimeEntry"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export const MyTimeEntries: FC = () => {
  const {currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <Container maxWidth="lg">
      <PageHeader title="My Time Entries">
        <AddTimeEntryButton
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </PageHeader>

      <TimeEntryTable
        additionalQueryConditions={[{user: {Equal: currentUser._id}}]}
        hiddenColumns={["user"]}
        dependencies={[refreshTrigger]}
      />
    </Container>
  )
}
