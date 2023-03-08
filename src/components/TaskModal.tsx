import {AttachFile, Close, Edit} from "@mui/icons-material"
import {TabContext, TabList, TabPanel} from "@mui/lab"
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tooltip
} from "@mui/material"
import {Task} from "api/sdk"
import dayjs from "dayjs"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useState} from "react"
import {Link} from "react-router-dom"
import {dynamicFormatDate} from "utils/helpers"
import {CommentSection} from "./CommentSection"
import {LabeledInfo} from "./LabeledInfo"
import {TimeEntryTable} from "./TimeEntryTable"

export interface TaskModalProps {
  task: Task | null
  handleClose: () => void
  getEditRoute: (task: Task) => string
}

export const TaskModal: FC<TaskModalProps> = (props) => {
  const {task, handleClose, getEditRoute} = props
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
          <LabeledInfo label="Description">
            {task.description || "None"}
          </LabeledInfo>

          <Stack direction="row" spacing={2} my={2}>
            <LabeledInfo label="User">{task.userName}</LabeledInfo>
            <LabeledInfo label="State">{task.state}</LabeledInfo>
            <LabeledInfo label="Created">
              {dynamicFormatDate(dayjs(task.createdAt))}
            </LabeledInfo>
            {permissions.manageTasks && (
              <div>
                <Button
                  variant="text"
                  color="primary"
                  startIcon={<Edit />}
                  component={Link}
                  to={getEditRoute(task)}
                >
                  Edit
                </Button>
              </div>
            )}
          </Stack>

          <LabeledInfo label="Attachments">
            {task.attachments.length === 0 && "None"}
            <List>
              {task.attachments.map(({file, name}) => (
                <ListItem key={file} disablePadding>
                  <ListItemButton
                    component="a"
                    dense
                    href={file}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ListItemIcon>
                      <AttachFile />
                    </ListItemIcon>

                    <ListItemText primary={name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </LabeledInfo>

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
                <Tab label="Time Entries" value="2" />
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
