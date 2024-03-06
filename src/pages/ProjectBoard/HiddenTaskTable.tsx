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
  state: "Delivered" | "Cancelled"
  openModal: boolean
  closeModal: () => void
}

export const HiddenTaskTable: FC<HiddenTaskTableProps> = (props) => {
  const {project, state, openModal, closeModal} = props

  const permissions = usePermissions()
  const navigate = useNavigate()

  return (
    <Dialog open={openModal} onClose={closeModal} fullWidth maxWidth="md">
      <DialogTitle sx={{pr: 5}}>
        {state === "Delivered" ? "Delivered Tasks" : "Cancelled Tasks"}

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
        {/* <Box sx={{mt: 1}}> */}
        <TaskTable
          additionalQueryConditions={[
            {project: {Equal: project._id}},
            {
              state: {
                Equal:
                  state === "Delivered"
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
        {/* </Box> */}
      </DialogContent>
    </Dialog>
  )
}
