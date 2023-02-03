import {
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {Button, InputAdornment, Stack, TextField} from "@mui/material"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import {useFormik} from "formik"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

// Form validation schema. See: https://www.npmjs.com/package/yup#object
const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  rate: yup.number().typeError("Must be a number")
})

export interface AddProjectButtonProps {
  afterSubmit: () => void
}

export const AddProjectButton: FC<AddProjectButtonProps> = (props) => {
  const {session, currentUser} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      rate: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.project.insert({
        ...values,
        _id: crypto.randomUUID(),
        organization: currentUser.organization,
        rate: values.rate ? +values.rate : undefined
      })

      props.afterSubmit()
      onClose()
    }
  })

  return (
    <>
      <Button onClick={() => setShowCreateForm(true)} startIcon={<Add />}>
        Add Project
      </Button>

      <DialogForm
        title="New Project"
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
          <TextField
            label="Name"
            {...makeFormikTextFieldProps(formik, "name")}
          />
          <TextField
            label="Rate"
            {...makeFormikNumericTextFieldProps(formik, "rate")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              )
            }}
          />
        </Stack>
      </DialogForm>
    </>
  )
}
