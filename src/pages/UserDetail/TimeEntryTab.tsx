import type {User} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useState} from "react"

export interface TimeEntryTabProps {
  user: User
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({user}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const permissions = usePermissions()

  return (
    <>
      {(permissions.canManageAllTime || permissions.canSubmitTime) && (
        <div style={{textAlign: "right"}}>
          <AddTimeEntryButton
            user={user}
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
            sx={{mb: 1}}
          />
        </div>
      )}
      <TimeEntryTable
        additionalQueryConditions={[{user: {Equal: user._id}}]}
        hiddenColumns={["projectName"]}
        dependencies={[refreshTrigger]}
      />
    </>
  )
}
