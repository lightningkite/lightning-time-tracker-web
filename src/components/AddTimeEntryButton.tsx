import {
  makeFormikAutocompleteProps,
  makeFormikDatePickerProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import type {SxProps} from "@mui/material"
import {Button, Stack, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import type {Project, Task, User} from "api/sdk"
import {TaskState} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import {useFormik} from "formik"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import {useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dayjsToISO, stringToDuration} from "utils/helpers"
import * as yup from "yup"

dayjs.extend(duration)

const validationSchema = yup.object().shape({
  summary: yup.string().required("Required"),
  projectRequired: yup.boolean(),
  project: yup
    .object()
    .nullable()
    .when("projectRequired", {
      is: true,
      then: () => yup.object().required("Required").nullable()
    }),

  user: yup.object().required("Required").nullable(),
  date: yup.date().required("Required"),
  duration: yup
    .string()
    .required("Required")
    .test(
      "is-valid-duration",
      "Invalid duration",
      (value) => value !== undefined && stringToDuration(value) !== null
    )
})

export interface AddTimeEntryButtonProps {
  afterSubmit: () => void
  project?: Project
  user?: User
  task?: Task
  sx?: SxProps
}

export const AddTimeEntryButton: FC<AddTimeEntryButtonProps> = (props) => {
  const {
    afterSubmit,
    project: initialProject,
    user: initialUser,
    task: initialTask,
    sx
  } = props
  const {session, currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      task: null as Task | null,
      user: initialUser ?? currentUser,
      projectRequired: !initialTask,
      project: initialProject ?? null,
      summary: "",
      duration: "",
      date: dayjs()
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.timeEntry.insert({
        _id: crypto.randomUUID(),
        task: initialTask?._id ?? values.task?._id,
        project: initialTask?.project ?? values.project!._id,
        organization: currentUser.organization,
        durationMilliseconds: stringToDuration(
          values.duration
        )!.asMilliseconds(),
        date: dayjsToISO(values.date),
        user: values.user._id,
        taskSummary: undefined,
        projectName: undefined,
        organizationName: undefined,
        userName: undefined,
        summary: values.summary
      })

      afterSubmit()
      onClose()
    }
  })

  useEffect(() => {
    formik.setFieldValue("task", null)
  }, [formik.values.project])

  return (
    <>
      <Button
        onClick={() => setShowCreateForm(true)}
        startIcon={<Add />}
        sx={sx}
      >
        Record Time Entry
      </Button>

      <DialogForm
        title="New Time Entry"
        open={showCreateForm}
        onClose={onClose}
        onSubmit={async () => {
          await formik.submitForm()
          if (shouldPreventSubmission(formik)) {
            throw new Error("Please fix the errors above.")
          }
        }}
      >
        <Stack gap={3}>
          {!initialUser && permissions.canManageAllTime && (
            <RestAutocompleteInput
              label="User"
              restEndpoint={session.user}
              getOptionLabel={(user) => user.name || user.email}
              searchProperties={["name", "email"]}
              additionalQueryConditions={[
                {organization: {Equal: currentUser.organization}}
              ]}
              {...makeFormikAutocompleteProps(formik, "user")}
            />
          )}

          {!initialProject && !initialTask && (
            <RestAutocompleteInput
              label="Project"
              restEndpoint={session.project}
              getOptionLabel={(project) => project.name}
              searchProperties={["name"]}
              additionalQueryConditions={[
                {organization: {Equal: currentUser.organization}}
              ]}
              {...makeFormikAutocompleteProps(formik, "project")}
            />
          )}

          {!initialTask && (
            <RestAutocompleteInput
              label="Task"
              restEndpoint={session.task}
              getOptionLabel={(task) => task.summary}
              searchProperties={["summary"]}
              disabled={!formik.values.project}
              dependencies={[formik.values.project]}
              additionalQueryConditions={[
                formik.values.project
                  ? {project: {Equal: formik.values.project._id}}
                  : {Never: true},
                {state: {NotEqual: TaskState.Delivered}}
              ]}
              {...makeFormikAutocompleteProps(formik, "task")}
            />
          )}

          <DatePicker
            label="Date"
            {...makeFormikDatePickerProps(formik, "date")}
            minDate={dayjs().subtract(1, "month")}
            maxDate={dayjs()}
          />

          <TextField
            label="Duration"
            placeholder="hh:mm:ss"
            {...makeFormikTextFieldProps(formik, "duration")}
          />

          <TextField
            label="Summary"
            multiline
            {...makeFormikTextFieldProps(formik, "summary")}
          />
        </Stack>
      </DialogForm>
    </>
  )
}
