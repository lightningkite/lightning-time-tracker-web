import {Close} from "@mui/icons-material"
import {TabContext, TabList, TabPanel} from "@mui/lab"
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tooltip
} from "@mui/material"
import type {Task} from "api/sdk"
import {usePermissions} from "hooks/usePermissions"
import {TaskForm} from "pages/TaskDetail/TaskForm"
import type {FC} from "react";
import React, { useState} from "react"
import {CommentSection} from "./CommentSection"
import {TimeEntryTable} from "./TimeEntryTable"

export interface TaskModalProps {
  task: Task | null
  setTask: (task: Task) => void
  handleClose: () => void
}

export const TaskModal: FC<TaskModalProps> = (props) => {
  const {task, handleClose, setTask} = props
  const [tab, setTab] = useState("1")
  const permissions = usePermissions()

  return (
    <Dialog open={!!task} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{pr: 5}}>
        {task?.summary}

        <Tooltip title="Close">
          <IconButton
            onClick={handleClose}
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

      {task && (
        <DialogContent>
          <Box mt={1}>
            <TaskForm task={task} setTask={setTask} />
          </Box>

          <TabContext value={tab}>
            <Box
              sx={{
                mt: 4,
                mb: 1,
                borderBottom: 1,
                borderColor: "divider"
              }}
            >
              <TabList onChange={(_e, v) => setTab(v as string)}>
                <Tab label="Comments" value="1" />
                {permissions.canViewIndividualTimeEntries && (
                  <Tab label="Time Entries" value="2" />
                )}
              </TabList>
            </Box>

            <TabPanel value="1" sx={{p: 0, pt: 2}}>
              <CommentSection task={task} />
            </TabPanel>
            <TabPanel value="2" sx={{p: 0, pt: 2}}>
              <TimeEntryTable
                additionalQueryConditions={[{task: {Equal: task._id}}]}
                hiddenColumns={["projectName", "taskSummary"]}
                preventClick
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
      )}

      <DialogContent sx={{pb: 2}}></DialogContent>
    </Dialog>
  )
}
