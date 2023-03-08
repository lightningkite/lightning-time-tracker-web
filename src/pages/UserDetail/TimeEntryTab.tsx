import {User} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import React, {FC, useState} from "react"

export interface TimeEntryTabProps {
  user: User
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({user}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTimeEntryButton
          user={user}
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          sx={{mb: 1}}
        />
      </div>
      <TimeEntryTable
        additionalQueryConditions={[{user: {Equal: user._id}}]}
        hiddenColumns={["projectName"]}
        dependencies={[refreshTrigger]}
      />
    </>
  )
}
