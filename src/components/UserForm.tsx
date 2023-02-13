import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import {
  makeFormikCheckboxProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField
} from "@mui/material"
import {User} from "api/sdk"
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
      isSuperUser: user.isSuperUser
    },
    validationSchema,
    // When the form is submitted, this function is called if the form values are valid
    onSubmit: async (values, {resetForm}) => {
      setError("")

      // Convert date fields from Date back to ISO string
      const formattedValues = {
        ...values
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
