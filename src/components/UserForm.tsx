import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikCheckboxProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  capitalize,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Stack,
  TextField
} from "@mui/material"
import {TaskState, User} from "api/sdk"
import {useFormik} from "formik"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
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

  // Formik is a library for managing form state. See: https://formik.org/docs/overview
  const formik = useFormik({
    initialValues: {
      email: user.email,
      name: user.name,
      isSuperUser: user.isSuperUser,
      defaultStates: user.defaultFilters.states
    },
    validationSchema,
    // When the form is submitted, this function is called if the form values are valid
    onSubmit: async (values, {resetForm}) => {
      setError("")

      // Convert date fields from Date back to ISO string
      const formattedValues: Partial<User> = {
        email: values.email,
        name: values.name,
        isSuperUser: values.isSuperUser,
        defaultFilters: {
          ...user.defaultFilters,
          states: values.defaultStates
        }
      }

      // Automatically builds the Lightning Server modification given the old object and the new values
      const modification = makeObjectModification(user, formattedValues)

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

      {user._id === currentUser._id && (
        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">States Cared About</FormLabel>
          <FormHelperText>
            Only tasks with these states will be shown on your dashboard
          </FormHelperText>
          <FormGroup>
            {Object.values(TaskState).map((state) => (
              <FormControlLabel
                key={state}
                control={
                  <Checkbox
                    checked={formik.values.defaultStates.includes(state)}
                    onChange={(e) => {
                      const nowChecked = e.target.checked
                      const wasChecked =
                        formik.values.defaultStates.includes(state)

                      if (nowChecked && !wasChecked) {
                        formik.setFieldValue(
                          "defaultStates",
                          formik.values.defaultStates.concat(state)
                        )
                      } else if (!nowChecked && wasChecked) {
                        formik.setFieldValue(
                          "defaultStates",
                          formik.values.defaultStates.filter((s) => s !== state)
                        )
                      }
                    }}
                  />
                }
                label={capitalize(state)}
              />
            ))}
          </FormGroup>
        </FormControl>
      )}

      <FormControlLabel
        control={
          <Checkbox {...makeFormikCheckboxProps(formik, "isSuperUser")} />
        }
        label="Is Super User"
        disabled={currentUser._id === user._id}
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
