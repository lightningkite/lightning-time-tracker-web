import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {Alert, InputAdornment, Stack, TextField} from "@mui/material"
import {Project} from "api/sdk"
import {useFormik} from "formik"
import {usePermissions} from "hooks/usePermissions"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  rate: yup.number().typeError("Must be a number")
})

export interface ProjectFormProps {
  project: Project
  setProject: (project: Project) => void
}

export const ProjectForm: FC<ProjectFormProps> = (props) => {
  const {project, setProject} = props
  const {session} = useContext(AuthContext)
  const permissions = usePermissions()

  const [error, setError] = useState("")

  // Formik is a library for managing form state. See: https://formik.org/docs/overview
  const formik = useFormik({
    initialValues: {
      name: project.name,
      rate: project.rate?.toString() ?? "",
      notes: project.notes
    },
    validationSchema,
    // When the form is submitted, this function is called if the form values are valid
    onSubmit: async (values, {resetForm}) => {
      setError("")

      // Convert date fields from Date back to ISO string
      const formattedValues: Partial<Project> = {
        ...values,
        rate: values.rate ? +values.rate : null
      }

      // Automatically builds the Lightning Server modification given the old object and the new values
      const modification = makeObjectModification(project, formattedValues)

      // Handle the case where nothing changed (this shouldn't happen, but we gotta make TypeScript happy)
      if (!modification) {
        return
      }

      try {
        const updatedProject = await session.project.modify(
          project._id,
          modification
        )
        setProject(updatedProject)

        resetForm({values})
      } catch {
        setError("Error updating project")
      }
    }
  })

  const canEdit = permissions.manageProjects

  return (
    <Stack gap={3}>
      <TextField
        label="Name"
        {...makeFormikTextFieldProps(formik, "name")}
        disabled={!canEdit}
      />
      <TextField
        label="Rate"
        {...makeFormikNumericTextFieldProps(formik, "rate")}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>
        }}
        disabled={!canEdit}
      />
      <TextField
        label="Notes"
        multiline
        minRows={2}
        {...makeFormikTextFieldProps(formik, "notes")}
        disabled={!canEdit}
      />

      {error && <Alert severity="error">{error}</Alert>}

      {canEdit && (
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
      )}
    </Stack>
  )
}
