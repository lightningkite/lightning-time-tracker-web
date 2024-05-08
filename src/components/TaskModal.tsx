import {Cancel, Close, Edit} from "@mui/icons-material"
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  TextField,
  Tooltip,
  Typography
} from "@mui/material"
import {TaskState, type User, type Task, type Project} from "api/sdk"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {CommentSection} from "./CommentSection"
import {TimeEntryTable} from "./TimeEntryTable"
import {
  makeFormikTextFieldProps,
  RestAutocompleteInput,
  makeFormikAutocompleteProps,
  makeFormikNumericTextFieldProps,
  makeFormikCheckboxProps
} from "@lightningkite/mui-lightning-components"
import dayjs from "dayjs"
import {
  makeUserTaskCondition,
  taskStateLabels,
  dynamicFormatDate
} from "utils/helpers"
import {AttachmentsInput} from "./AttachmentsInput"
import {FormSection} from "./FormSection"
import {LabeledInfo} from "./LabeledInfo"
import {PrioritySlider} from "./PrioritySlider"
import {PullRequestSection} from "./PullRequestSection/PullRequestSection"
import {useFormik} from "formik"
import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {AuthContext} from "utils/context"
import * as yup from "yup"
import {TabContext, TabList, TabPanel, LoadingButton} from "@mui/lab"
import {DeleteTaskButton} from "pages/TaskDetail/DeleteTaskButton"

const validationSchema = yup.object().shape({
  project: yup.object().required("Required"),
  state: yup.string().required("Required"),
  summary: yup.string().required("Required"),
  estimate: yup.number().min(0, "Must be positive").nullable()
})

export interface TaskModalProps {
  task: Task | null
  setTask: (task: Task) => void
  handleClose: () => void
}

export const TaskModal: FC<TaskModalProps> = (props) => {
  const {task, handleClose, setTask} = props
  const [tab, setTab] = useState("1")
  const permissions = usePermissions()

  const {session} = useContext(AuthContext)

  const [error, setError] = useState("")
  const [edit, setEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(false)

  const [loadedInitialAsyncValues, setLoadedInitialAsyncValues] =
    useState(false)

  const [possibleTags, setPossibleTags] = useState<string[]>([])

  const canEdit = permissions.canManageAllTasks
  const canEditSomeFields =
    canEdit || [TaskState.Active, TaskState.Hold].includes(task!.state)

  const formik = useFormik({
    initialValues: {
      user: null as User | null,
      project: null as Project | null,
      state: task?.state,
      summary: task?.summary,
      attachments: task?.attachments,
      description: task?.description,
      estimate: task?.estimate?.toString() ?? "",
      emergency: task?.emergency,
      priority: task?.priority,
      pullRequestLinks: task?.pullRequestLinks,
      tags: task?.tags
    },
    validationSchema,

    onSubmit: async (values, {resetForm}) => {
      setError("")
      const formattedValues: Partial<Task> = canEdit
        ? {
            ...values,
            user: values.user?._id,
            project: values.project?._id,
            estimate: values.estimate ? +values.estimate : null
          }
        : {
            summary: values.summary,
            description: values.description,
            attachments: values.attachments
          }

      // Automatically builds the Lightning Server modification given the old object and the new values
      const modification = makeObjectModification(task, formattedValues)

      // Handle the case where nothing changed (this shouldn't happen, but we gotta make TypeScript happy)
      if (!modification) {
        return
      }

      if (!task) {
        return
      }

      try {
        const updatedTask = await session.task.modify(task?._id, modification)
        setTask(updatedTask)
        resetForm({values})
      } catch {
        setError("Error updating task")
      }
    }
  })

  useEffect(() => {
    if (!task) return
    Promise.all([
      session.project.detail(task?.project),
      task?.user && canEdit ? session.user.detail(task?.user) : null
    ])
      .then(([project, user]) => {
        setPossibleTags(project.projectTags)
        formik.resetForm({values: {...formik.values, user, project}})
        setLoadedInitialAsyncValues(true)
      })
      .catch(() => alert("Error loading initial values"))
  }, [])

  return (
    <Dialog open={!!task} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{pr: 5}}>
        <Stack direction="row" alignItems="center">
          {task?.summary}
          {canEdit && (
            <Tooltip title="Edit Summary">
              <IconButton
                onClick={() => setEditTitle(!editTitle)}
                sx={{
                  color: (theme) => theme.palette.grey[500]
                }}
              >
                {editTitle ? <Close /> : <Edit />}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Typography color="text.disabled">{task?.projectName}</Typography>
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
            <FormSection disableTopPadding>
              {editTitle && (
                <TextField
                  label="Summary"
                  {...makeFormikTextFieldProps(formik, "summary")}
                  disabled={!canEditSomeFields}
                />
              )}

              <TextField
                label="Description"
                multiline
                {...makeFormikTextFieldProps(formik, "description")}
                minRows={3}
                sx={{mb: 3}}
                disabled={!canEditSomeFields}
              />

              {canEdit && (
                <>
                  <Stack
                    direction="row"
                    gap={3}
                    sx={{
                      alignItems: "center",
                      flexWrap: "wrap",
                      "& > *": {flexGrow: 1, minWidth: 150}
                    }}
                  >
                    <RestAutocompleteInput
                      label="Assignee"
                      restEndpoint={session.user}
                      getOptionLabel={(user) => user.name || user.email}
                      searchProperties={["email"]}
                      disabled={!loadedInitialAsyncValues}
                      additionalQueryConditions={[
                        makeUserTaskCondition({
                          project: task.project,
                          organization: task.organization
                        })
                      ]}
                      {...makeFormikAutocompleteProps(formik, "user")}
                    />
                    <TextField
                      select
                      label="State"
                      {...makeFormikTextFieldProps(formik, "state")}
                    >
                      {Object.values(TaskState).map((option) => (
                        <MenuItem key={option} value={option}>
                          {taskStateLabels[option]}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack
                    direction="row"
                    gap={3}
                    sx={{
                      alignItems: "center",
                      flexWrap: "wrap",
                      "& > *": {flexGrow: 1, minWidth: 150}
                    }}
                  >
                    <Autocomplete
                      renderInput={(params) => (
                        <TextField {...params} label={"Tags"} />
                      )}
                      options={possibleTags ?? []}
                      multiple
                      onChange={(_, v) => {
                        formik.setFieldValue("tags", v)
                      }}
                      value={formik.values.tags}
                    />
                    <TextField
                      label="Estimate (hours)"
                      {...makeFormikNumericTextFieldProps(formik, "estimate")}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">hours</InputAdornment>
                        )
                      }}
                      sx={{maxWidth: 300}}
                    />
                  </Stack>
                  <LabeledInfo label="Created">
                    {[
                      task.creatorName,
                      dynamicFormatDate(dayjs(task.createdAt))
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </LabeledInfo>

                  <FormControlLabel
                    control={
                      <Checkbox
                        {...makeFormikCheckboxProps(formik, "emergency")}
                      />
                    }
                    label="Emergency"
                  />
                  <PrioritySlider
                    onChange={(v) => formik.setFieldValue("priority", v)}
                    value={formik.values.priority!}
                  />
                </>
              )}

              {permissions.doesCareAboutPRs && (
                <>
                  <FormSection
                    title="Pull Request"
                    titleIcon={
                      <Button
                        onClick={() => setEdit(!edit)}
                        startIcon={edit ? <Cancel /> : <Edit />}
                      >
                        Manage PR
                      </Button>
                    }
                  >
                    <PullRequestSection
                      edit={edit}
                      urls={formik.values.pullRequestLinks ?? []}
                      setUrls={(value) =>
                        formik.setFieldValue("pullRequestLinks", value)
                      }
                    />
                  </FormSection>
                </>
              )}

              <FormSection title="Attachments">
                <AttachmentsInput
                  attachments={formik.values.attachments!}
                  onChange={(value) => {
                    formik.setFieldValue("attachments", value)
                  }}
                  error={
                    formik.submitCount
                      ? (formik.errors.attachments as string)
                      : undefined
                  }
                  disabled={!canEditSomeFields}
                />
              </FormSection>
            </FormSection>
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

      <Stack alignContent="end">
        <LoadingButton
          onClick={() => formik.submitForm()}
          variant="contained"
          color="primary"
          loading={formik.isSubmitting}
          style={{alignSelf: "end", margin: "0.5rem"}}
          disabled={!formik.dirty}
        >
          {formik.dirty ? "Save Changes" : "Saved"}
        </LoadingButton>
      </Stack>
    </Dialog>
  )
}
