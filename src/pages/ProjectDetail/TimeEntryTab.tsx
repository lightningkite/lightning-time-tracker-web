import {Project} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useState} from "react"

export interface TimeEntryTabProps {
  project: Project
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({project}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const permissions = usePermissions()

  return (
    <>
      {permissions.timeEntries && (
        <div style={{textAlign: "right"}}>
          <AddTimeEntryButton
            project={project}
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
            sx={{mb: 1}}
          />
        </div>
      )}
      <TimeEntryTable
        additionalQueryConditions={[{project: {Equal: project._id}}]}
        hiddenColumns={["projectName"]}
        dependencies={[refreshTrigger]}
        preventClick={!permissions.timeEntries}
      />
    </>
  )
}
