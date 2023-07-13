import type {Project} from "api/sdk"
import {AddTaskButton} from "components/AddTaskButton"
import {TaskTable} from "components/TaskTable"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react";
import React, { useState} from "react"
import {useNavigate} from "react-router-dom"

export interface TaskTabProps {
  project: Project
}

export const TaskTab: FC<TaskTabProps> = ({project}) => {
  const navigate = useNavigate()
  const permissions = usePermissions()

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <>
      {(permissions.canManageAllTasks || permissions.canReportNewTasks) && (
        <div style={{textAlign: "right"}}>
          <AddTaskButton
            project={project}
            afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
            sx={{mb: 1}}
          />
        </div>
      )}

      <TaskTable
        additionalQueryConditions={[{project: {Equal: project._id}}]}
        dependencies={[refreshTrigger]}
        onRowClick={(task) =>
          navigate(`/projects/${project._id}/tasks/${task._id}`)
        }
      />
    </>
  )
}
