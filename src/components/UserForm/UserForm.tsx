import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikCheckboxProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  Autocomplete,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material"
import {Project, User, UserRole} from "api/sdk"
import FormSection from "components/FormSection"
import {useFormik} from "formik"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {camelCaseToTitleCase} from "utils/helpers"
import * as yup from "yup"

// Form validation schema. See: https://www.npmjs.com/package/yup#object
const validationSchema = yup.object().shape({
  email: yup.string().email().required("Required"),
  name: yup.string().required("Required")
})

export interface UserFormProps {
  user: User
  setUser: (user: User) => void
}

export const UserForm: FC<UserFormProps> = (props) => {
  const {user, setUser} = props
  const {session, currentUser, setCurrentUser} = useContext(AuthContext)

  const [error, setError] = useState("")
  const [projectOptions, setProjectOptions] = useState<Project[]>()

  useEffect(() => {
    session.project
      .query({
        condition: {organization: {Equal: currentUser.organization}},
        orderBy: ["name"]
      })
      .then(setProjectOptions)
      .catch(() => alert("Error loading projects"))
  }, [])

  // Formik is a library for managing form state. See: https://formik.org/docs/overview
  const formik = useFormik({
    initialValues: {
      email: user.email,
      name: user.name,
      isSuperUser: user.isSuperUser,
      limitToProjects: user.limitToProjects ?? [],
      projectFavorites: user.projectFavorites,
      active: user.active,
      role: user.role
    },
    validationSchema,
    // When the form is submitted, this function is called if the form values are valid
    onSubmit: async (values, {resetForm}) => {
      setError("")

      // Automatically builds the Lightning Server modification given the old object and the new values
      const modification = makeObjectModification(user, values)

      // Handle the case where nothing changed (this shouldn't happen, but we gotta make TypeScript happy)
      if (!modification) {
        return
      }

      try {
        const updatedUser = await session.user.modify(user._id, modification)
        setUser(updatedUser)

        if (currentUser._id === user._id) {
          setCurrentUser(updatedUser)
        }

        resetForm({values})
      } catch {
        setError("Error updating user")
      }
    }
  })

  return (
    <Stack gap={3}>
      <TextField label="Email" {...makeFormikTextFieldProps(formik, "email")} />

      <TextField label="Name" {...makeFormikTextFieldProps(formik, "name")} />

      {user._id === currentUser._id &&
        !!currentUser.limitToProjects?.length && (
          <>
            <Autocomplete
              multiple
              options={projectOptions ?? []}
              getOptionLabel={(project) => project.name}
              isOptionEqualToValue={(a, b) => a._id === b._id}
              disableCloseOnSelect
              disableClearable
              value={
                projectOptions?.filter((project) =>
                  formik.values.projectFavorites.includes(project._id)
                ) ?? []
              }
              onChange={(_e, value) => {
                formik.setFieldValue(
                  "projectFavorites",
                  value.map((project) => project._id)
                )
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Favorite Projects"
                  helperText="These projects will be shown first in the project view"
                />
              )}
            />
          </>
        )}

      {user._id !== currentUser._id && (
        <FormSection title="Permissions">
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox {...makeFormikCheckboxProps(formik, "active")} />
              }
              label="Active"
            />

            <FormControlLabel
              control={
                <Checkbox {...makeFormikCheckboxProps(formik, "isSuperUser")} />
              }
              label="Is Super User"
            />
          </Stack>

          {!formik.values.isSuperUser && (
            <>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={formik.values.role}
                  onChange={(e) => {
                    formik.setFieldValue("role", e.target.value)
                  }}
                >
                  {Object.values(UserRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {camelCaseToTitleCase(role)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                options={projectOptions ?? []}
                getOptionLabel={(project) => project.name}
                isOptionEqualToValue={(a, b) => a._id === b._id}
                disableCloseOnSelect
                disableClearable
                value={
                  projectOptions?.filter((project) =>
                    formik.values.limitToProjects.includes(project._id)
                  ) ?? []
                }
                onChange={(e, value) => {
                  formik.setFieldValue(
                    "limitToProjects",
                    value.map((project) => project._id)
                  )
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Limit to Projects"
                    helperText="This user will only be able to access these projects"
                  />
                )}
              />
            </>
          )}
        </FormSection>
      )}

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
