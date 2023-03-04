import {Task} from "api/sdk"
import {AddTimeEntryButton} from "components/AddTimeEntryButton"
import {TimeEntryTable} from "components/TimeEntryTable"
import React, {FC, useState} from "react"

export interface TimeEntryTabProps {
  task: Task
}

export const TimeEntryTab: FC<TimeEntryTabProps> = ({task}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTimeEntryButton
          task={task}
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          sx={{mb: 1}}
        />
      </div>
      <TimeEntryTable
        additionalQueryConditions={[{task: {Equal: task._id}}]}
        hiddenColumns={["projectName", "taskSummary"]}
        dependencies={[refreshTrigger]}
      />
    </>
  )
}
