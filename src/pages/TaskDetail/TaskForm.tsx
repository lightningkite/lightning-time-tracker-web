import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikAutocompleteProps,
  makeFormikCheckboxProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Cancel, Edit} from "@mui/icons-material"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField
} from "@mui/material"
import type {Project, Task, User} from "api/sdk"
import {TaskState} from "api/sdk"
import {AttachmentsInput} from "components/AttachmentsInput"
import {FormSection} from "components/FormSection"
import {LabeledInfo} from "components/LabeledInfo"
import {PrioritySlider} from "components/PrioritySlider"
import {PullRequestSection} from "components/PullRequestSection/PullRequestSection"
import dayjs from "dayjs"
import {useFormik} from "formik"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import {useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {
  dynamicFormatDate,
  makeUserTaskCondition,
  taskStateLabels
} from "utils/helpers"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  project: yup.object().required("Required"),
  state: yup.string().required("Required"),
  summary: yup.string().required("Required"),
  estimate: yup.number().min(0, "Must be positive").nullable()
})

export interface TaskFormProps {
  task: Task
  setTask: (task: Task) => void
}

export const TaskForm: FC<TaskFormProps> = (props) => {
  const {task, setTask} = props

  const {session} = useContext(AuthContext)
  const permissions = usePermissions()

  const [error, setError] = useState("")
  const [edit, setEdit] = useState(false)

  const [loadedInitialAsyncValues, setLoadedInitialAsyncValues] =
    useState(false)

  const [possibleTags, setPossibleTags] = useState<string[]>([])

  const canEdit = permissions.canManageAllTasks
  const canEditSomeFields =
    canEdit || [TaskState.Active, TaskState.Hold].includes(task.state)

  const formik = useFormik({
    initialValues: {
      user: null as User | null,
      project: null as Project | null,
      state: task.state,
      summary: task.summary,
      attachments: task.attachments,
      description: task.description,
      estimate: task.estimate?.toString() ?? "",
      emergency: task.emergency,
      priority: task.priority,
      pullRequestLinks: task.pullRequestLinks,
      tags: task.tags
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

      try {
        const updatedTask = await session.task.modify(task._id, modification)
        setTask(updatedTask)
        resetForm({values})
      } catch {
        setError("Error updating task")
      }
    }
  })

  useEffect(() => {
    Promise.all([
      session.project.detail(task.project),
      task.user && canEdit ? session.user.detail(task.user) : null
    ])
      .then(([project, user]) => {
        setPossibleTags(project.projectTags)
        formik.resetForm({values: {...formik.values, user, project}})
        setLoadedInitialAsyncValues(true)
      })
      .catch(() => alert("Error loading initial values"))
  }, [])

  return (
    <>
      <FormSection disableTopPadding>
        <TextField
          label="Summary"
          {...makeFormikTextFieldProps(formik, "summary")}
          disabled={!canEditSomeFields}
        />

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
              {[task.creatorName, dynamicFormatDate(dayjs(task.createdAt))]
                .filter(Boolean)
                .join(", ")}
            </LabeledInfo>

            <FormControlLabel
              control={
                <Checkbox {...makeFormikCheckboxProps(formik, "emergency")} />
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

      <Stack mt={4} spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <LoadingButton
          onClick={() => {
            formik.submitForm()
          }}
          variant="contained"
          color="primary"
          loading={formik.isSubmitting}
          style={{alignSelf: "end", marginTop: 30}}
          disabled={!formik.dirty}
        >
          {formik.dirty ? "Save Changes" : "Saved"}
        </LoadingButton>
      </Stack>
    </>
  )
}
