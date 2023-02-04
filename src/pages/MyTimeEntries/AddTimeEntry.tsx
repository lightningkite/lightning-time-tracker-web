import {
  makeFormikAutocompleteProps,
  makeFormikDateTimePickerProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {Button, Stack, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import {Project, Task} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import dayjs from "dayjs"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import * as yup from "yup"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

const validationSchema = yup.object().shape({})

export interface AddTimeEntryButtonProps {
  afterSubmit: () => void
}

export const AddTimeEntryButton: FC<AddTimeEntryButtonProps> = (props) => {
  const {session, currentUser} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      task: null as Task | null,
      project: null as Project | null,
      summary: "",
      duration: dayjs.duration(0, "minutes"),
      date: new Date()
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.timeEntry.insert({
        ...values,
        _id: crypto.randomUUID(),
        task: values.task?._id,
        project: values.project?._id,
        organization: currentUser.organization,
        duration: values.duration.toISOString(),
        date: dateToISO(values.date),
        user: currentUser._id
      })

      props.afterSubmit()
      onClose()
    }
  })

  useEffect(() => {
    formik.setFieldValue("task", null)
  }, [formik.values.project])

  return (
    <>
      <Button onClick={() => setShowCreateForm(true)} startIcon={<Add />}>
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
          <RestAutocompleteInput
            label="Project"
            restEndpoint={session.project}
            getOptionLabel={(project) => project.name}
            searchProperties={["name"]}
            {...makeFormikAutocompleteProps(formik, "project")}
          />

          <RestAutocompleteInput
            label="Task"
            restEndpoint={session.task}
            getOptionLabel={(task) => task.description}
            searchProperties={["description"]}
            disabled={!formik.values.project}
            dependencies={[formik.values.project]}
            additionalQueryConditions={[
              {project: {Equal: formik.values.project?._id ?? ""}}
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
            label="Summary"
            multiline
            {...makeFormikTextFieldProps(formik, "summary")}
          />
        </Stack>
      </DialogForm>
    </>
  )
}
