import type {User} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import {TaskTable} from "components/TaskTable"
import type {FC} from "react";
import React, { useState} from "react"
import {useNavigate} from "react-router-dom"

export interface TaskTabProps {
  user: User
}

export const TaskTab: FC<TaskTabProps> = ({user}) => {
  const navigate = useNavigate()

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      <div style={{textAlign: "right"}}>
        <AddTaskButton
          user={user}
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
          sx={{mb: 1}}
        />
      </div>

      <TaskTable
        additionalQueryConditions={[{user: {Equal: user._id}}]}
        dependencies={[refreshTrigger]}
        onRowClick={(task) => navigate(`/users/${user._id}/tasks/${task._id}`)}
      />
    </>
  )
}
