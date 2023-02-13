import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikAutocompleteProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {Alert, InputAdornment, MenuItem, Stack, TextField} from "@mui/material"
import {Task, TaskState, User} from "api/sdk"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  user: yup.object().required("Required"),
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

  const [error, setError] = useState("")
  const [loadedInitialAsyncValues, setLoadedInitialAsyncValues] =
    useState(false)

  const formik = useFormik({
    initialValues: {
      user: null as User | null,
      state: task.state,
      summary: task.summary,
      description: task.description,
      estimate: task.estimate?.toString() ?? ""
    },
    validationSchema,

    onSubmit: async (values, {resetForm}) => {
      setError("")

      const formattedValues: Partial<Task> = {
        ...values,
        user: values.user?._id,
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

  useEffect(() => {
    session.user.detail(task.user).then((user) => {
      formik.resetForm({values: {...formik.values, user}})
      setLoadedInitialAsyncValues(true)
    })
  }, [])

  return (
    <Stack gap={3}>
      <RestAutocompleteInput
        label="User"
        restEndpoint={session.user}
        getOptionLabel={(user) => user.name || user.email}
        searchProperties={["email"]}
        disabled={!loadedInitialAsyncValues}
        {...makeFormikAutocompleteProps(formik, "user")}
      />
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
        select
        label="State"
        {...makeFormikTextFieldProps(formik, "state")}
      >
        {Object.values(TaskState).map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
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
