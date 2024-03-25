import {Close} from "@mui/icons-material"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip
} from "@mui/material"
import {type Project, TaskState} from "api/sdk"
import {TaskTable} from "components/TaskTable"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import {useNavigate} from "react-router-dom"

export interface HiddenTaskTableProps {
  project: Project
  showTaskModal: "Delivered" | "Cancelled" | null
  closeModal: () => void
}

export const HiddenTaskTable: FC<HiddenTaskTableProps> = (props) => {
  const {project, showTaskModal, closeModal} = props

  const permissions = usePermissions()
  const navigate = useNavigate()

  return (
    <Dialog
      open={showTaskModal !== null}
      onClose={closeModal}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{pr: 5}}>
        {showTaskModal === "Delivered" ? "Delivered Tasks" : "Cancelled Tasks"}

        <Tooltip title="Close">
          <IconButton
            onClick={closeModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent>
        <TaskTable
          additionalQueryConditions={[
            {project: {Equal: project._id}},
            {
              state: {
                Equal:
                  showTaskModal === "Delivered"
                    ? TaskState.Delivered
                    : TaskState.Cancelled
              }
            }
          ]}
          dependencies={[]}
          onRowClick={(task) =>
            permissions.canManageAllTasks
              ? navigate(`/projects/${project._id}/tasks/${task._id}`)
              : {}
          }
        />
      </DialogContent>
    </Dialog>
  )
}
