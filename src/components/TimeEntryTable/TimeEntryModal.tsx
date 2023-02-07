import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikAutocompleteProps,
  makeFormikDateTimePickerProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Stack, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import {Project, Task, TimeEntry} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import Loading from "components/Loading"
import dayjs from "dayjs"
import duration, {Duration} from "dayjs/plugin/duration"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateFromISO, dateToISO, stringToDuration} from "utils/helpers"
import * as yup from "yup"

dayjs.extend(duration)

export interface TimeEntryModalProps {
  timeEntry: TimeEntry | null
  onClose: () => void
}
const validationSchema = yup.object().shape({
  summary: yup.string().required("Required"),
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

export const TimeEntryModal: FC<TimeEntryModalProps> = (props) => {
  const {timeEntry, onClose} = props
  const {session, currentUser} = useContext(AuthContext)

  const [loadedInitialAsyncValues, setLoadedInitialAsyncValues] =
    useState(false)

  const formik = useFormik({
    initialValues: {
      task: null as Task | null,
      project: null as Project | null,
      summary: "",
      duration: "",
      date: null as Date | null
    },
    validationSchema,
    onSubmit: async (values) => {
      const formattedValues: Partial<TimeEntry> = {
        ...values,
        task: values.task?._id,
        project: values.project?._id,
        durationMilliseconds: (
          stringToDuration(values.duration) as Duration
        ).asMilliseconds(),
        date: dateToISO(values.date as Date, false)
      }

      const modification = makeObjectModification(timeEntry, formattedValues)

      if (!modification) return
      await session.timeEntry.modify((timeEntry as TimeEntry)._id, modification)

      onClose()
    }
  })

  useEffect(() => {
    formik.values.project?._id !== formik.values.task?.project &&
      formik.setFieldValue("task", null)
  }, [formik.values.project])

  useEffect(() => {
    setLoadedInitialAsyncValues(false)
    if (!timeEntry) return

    Promise.all([
      timeEntry.project && session.project.detail(timeEntry.project),
      timeEntry.task && session.task.detail(timeEntry.task)
    ])
      .then(([project, task]) => {
        formik.setValues({
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          project: project || null,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          task: task || null,
          summary: timeEntry.summary,
          duration: dayjs
            .duration(timeEntry.durationMilliseconds, "milliseconds")
            .format("HH:mm:ss"),
          date: dateFromISO(timeEntry.date)
        })
        setLoadedInitialAsyncValues(true)
      })
      .catch(() => alert("Error loading data"))
  }, [timeEntry])

  return (
    <DialogForm
      title="Time Entry"
      onClose={onClose}
      onSubmit={async () => {
        await formik.submitForm()
        if (shouldPreventSubmission(formik)) {
          throw new Error("Please fix the errors above.")
        }
      }}
      open={!!timeEntry}
      disableSubmitBtn={!loadedInitialAsyncValues || !formik.dirty}
    >
      {!loadedInitialAsyncValues ? (
        <Loading />
      ) : (
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
            getOptionLabel={(task) => task.summary}
            searchProperties={["summary"]}
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
      )}
    </DialogForm>
  )
}
