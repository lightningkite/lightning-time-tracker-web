import {
  makeFormikDateTimePickerProps,
  makeFormikTextFieldProps
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {Button, Stack, TextField} from "@mui/material"
import {DatePicker} from "@mui/x-date-pickers"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import dayjs from "dayjs"
import {useFormik} from "formik"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import * as yup from "yup"

// Form validation schema. See: https://www.npmjs.com/package/yup#object
const validationSchema = yup.object().shape({
  name: yup.string().required("Required"),
  email: yup.string().email().required("Required"),
  phone: yup.string().required("Required"),
  birthday: yup.date().required("Required").nullable()
})

export interface AddUserProps {
  afterSubmit: () => void
}

export const AddUserButton: FC<AddUserProps> = (props) => {
  const {session} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      birthday: null as Date | null
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.user.insert({
        ...values,
        _id: crypto.randomUUID(),
        birthday: dateToISO(values.birthday as Date),
        createdAt: dateToISO(new Date()),
        modifiedAt: dateToISO(new Date())
      })

      props.afterSubmit()
      onClose()
    }
  })

  return (
    <>
      <Button onClick={() => setShowCreateForm(true)} startIcon={<Add />}>
        Add User
      </Button>

      <DialogForm
        title="New User"
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
            label="Email"
            {...makeFormikTextFieldProps(formik, "email")}
          />
          <TextField
            label="Phone"
            {...makeFormikTextFieldProps(formik, "phone")}
          />
          <DatePicker
            label="Birthday"
            {...makeFormikDateTimePickerProps(formik, "birthday")}
            minDate={dayjs().subtract(120, "year")}
            maxDate={dayjs()}
          />
        </Stack>
      </DialogForm>
    </>
  )
}
