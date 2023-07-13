import type {Task} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {AuthContext} from "utils/context"

export interface TimeEntryTabProps {
  task: Task
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({task}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const {currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  return (
    <>
      {(permissions.canSubmitTime || permissions.canManageAllTime) && (
        <div style={{textAlign: "right"}}>
          <AddTimeEntryButton
            task={task}
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
            sx={{mb: 1}}
            user={currentUser}
          />
        </div>
      )}
      <TimeEntryTable
        additionalQueryConditions={[{task: {Equal: task._id}}]}
        hiddenColumns={["projectName", "taskSummary"]}
        dependencies={[refreshTrigger]}
        preventClick={!permissions.canManageAllTime}
      />
    </>
  )
}
