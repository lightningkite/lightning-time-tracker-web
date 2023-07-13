import type {Project} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {AuthContext} from "utils/context"

export interface TimeEntryTabProps {
  project: Project
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({project}) => {
  const permissions = usePermissions()
  const {currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      {(permissions.canSubmitTime || permissions.canManageAllTime) && (
        <div style={{textAlign: "right"}}>
          <AddTimeEntryButton
            project={project}
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
            sx={{mb: 1}}
            user={currentUser}
          />
        </div>
      )}
      <TimeEntryTable
        additionalQueryConditions={[{project: {Equal: project._id}}]}
        hiddenColumns={["projectName"]}
        dependencies={[refreshTrigger]}
        preventClick={!permissions.canManageAllTime}
      />
    </>
  )
}
