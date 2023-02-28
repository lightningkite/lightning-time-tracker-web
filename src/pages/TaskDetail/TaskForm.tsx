import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikAutocompleteProps,
  makeFormikCheckboxProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField
} from "@mui/material"
import {Project, Task, TaskState, User} from "api/sdk"
import FormSection from "components/FormSection"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  user: yup.object().required("Required"),
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

  const [error, setError] = useState("")
  const [loadedInitialAsyncValues, setLoadedInitialAsyncValues] =
    useState(false)

  const formik = useFormik({
    initialValues: {
      user: null as User | null,
      project: null as Project | null,
      state: task.state,
      summary: task.summary,
      description: task.description,
      estimate: task.estimate?.toString() ?? "",
      emergency: task.emergency
    },
    validationSchema,

    onSubmit: async (values, {resetForm}) => {
      setError("")

      const formattedValues: Partial<Task> = {
        ...values,
        user: values.user?._id,
        project: values.project?._id,
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
    Promise.all([
      session.project.detail(task.project),
      session.user.detail(task.user)
    ])
      .then(([project, user]) => {
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
        />

        <TextField
          label="Description"
          multiline
          {...makeFormikTextFieldProps(formik, "description")}
          minRows={3}
          sx={{mb: 3}}
        />
      </FormSection>

      <FormSection title="More Details">
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
            label="User"
            restEndpoint={session.user}
            getOptionLabel={(user) => user.name || user.email}
            searchProperties={["email"]}
            disabled={!loadedInitialAsyncValues}
            {...makeFormikAutocompleteProps(formik, "user")}
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
        </Stack>

        <RestAutocompleteInput
          label="Project"
          restEndpoint={session.project}
          getOptionLabel={(project) => project.name}
          searchProperties={["name"]}
          disabled={!loadedInitialAsyncValues}
          {...makeFormikAutocompleteProps(formik, "project")}
        />

        <TextField
          label="Estimate (hours)"
          {...makeFormikNumericTextFieldProps(formik, "estimate")}
          InputProps={{
            endAdornment: <InputAdornment position="end">hours</InputAdornment>
          }}
        />
        <FormControlLabel
          control={
            <Checkbox {...makeFormikCheckboxProps(formik, "emergency")} />
          }
          label="Emergency"
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
      </FormSection>
    </>
  )
}
