import {Project, User} from "api/sdk"
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
          project={project}
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          sx={{mb: 1}}
        />
      </div>
      <TimeEntryTable
        additionalQueryConditions={[{project: {Equal: project._id}}]}
        hiddenColumns={["project"]}
        dependencies={[refreshTrigger]}
      />
    </>
  )
}
