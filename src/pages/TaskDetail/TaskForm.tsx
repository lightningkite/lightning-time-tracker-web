import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {Alert, InputAdornment, Stack, TextField} from "@mui/material"
import {Task} from "api/sdk"
import {useFormik} from "formik"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

const validationSchema = yup.object().shape({
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

  const [error, setError] = useState("")

  const formik = useFormik({
    initialValues: {
      summary: task.summary,
      description: task.description,
      estimate: task.estimate?.toString() ?? ""
    },
    validationSchema,

    onSubmit: async (values, {resetForm}) => {
      setError("")

      const formattedValues: Partial<Task> = {
        ...values,
        estimate: values.estimate ? +values.estimate : null
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
        setError("Error updating project")
      }
    }
  })

  return (
    <Stack gap={3}>
      <TextField
        label="Summary"
        {...makeFormikTextFieldProps(formik, "summary")}
      />
      <TextField
        label="Description"
        multiline
        {...makeFormikTextFieldProps(formik, "description")}
      />
      <TextField
        label="Estimate (hours)"
        {...makeFormikNumericTextFieldProps(formik, "estimate")}
        InputProps={{
          endAdornment: <InputAdornment position="end">hours</InputAdornment>
        }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <LoadingButton
        onClick={() => {
          formik.submitForm()
        }}
        variant="contained"
        color="primary"
        loading={formik.isSubmitting}
        style={{alignSelf: "end"}}
        disabled={!formik.dirty}
      >
        {formik.dirty ? "Save Changes" : "Saved"}
      </LoadingButton>
    </Stack>
  )
}
