import {
  makeFormikAutocompleteProps,
  makeFormikDateTimePickerProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {Button, Stack, SxProps, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import {Project, Task, User} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import dayjs from "dayjs"
import duration, {Duration} from "dayjs/plugin/duration"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO, stringToDuration} from "utils/helpers"
import * as yup from "yup"

dayjs.extend(duration)

const validationSchema = yup.object().shape({
  summary: yup.string().required("Required"),
  project: yup.object().required("Required").nullable(),
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
  sx?: SxProps
}

export const AddTimeEntryButton: FC<AddTimeEntryButtonProps> = (props) => {
  const {afterSubmit, project: initialProject, user: initialUser, sx} = props
  const {session, currentUser} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      task: null as Task | null,
      user: initialUser ?? currentUser,
      project: initialProject ?? null,
      summary: "",
      duration: "",
      date: new Date()
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.timeEntry.insert({
        ...values,
        _id: crypto.randomUUID(),
        task: values.task?._id,
        project: (values.project as Project)._id,
        organization: currentUser.organization,
        durationMilliseconds: (
          stringToDuration(values.duration) as Duration
        ).asMilliseconds(),
        date: dateToISO(values.date),
        user: values.user._id,
        taskSummary: undefined,
        projectName: undefined,
        organizationName: undefined,
        userName: undefined
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
        Add Time Entry
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
          {!initialUser && (
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

          {!initialProject && (
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
                : {Never: true}
            ]}
            {...makeFormikAutocompleteProps(formik, "task")}
          />

          <DatePicker
            label="Date"
            {...makeFormikDateTimePickerProps(formik, "date")}
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
