import {
  makeFormikAutocompleteProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {Button, Stack, SxProps, TextField} from "@mui/material"
import {TaskState} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import {useFormik} from "formik"
import React, {FC, useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  user: yup.object().required("Required").nullable(),
  summary: yup.string().required("Required"),
  estimate: yup.number().integer().min(0).nullable()
})

export interface AddTaskButtonProps {
  afterSubmit: () => void
  projectId: string
  sx?: SxProps
}

export const AddTaskButton: FC<AddTaskButtonProps> = (props) => {
  const {afterSubmit, projectId, sx} = props
  const {session, currentUser} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  const formik = useFormik({
    initialValues: {
      user: currentUser,
      summary: "",
      description: "",
      estimate: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      await session.task.insert({
        ...values,
        _id: crypto.randomUUID(),
        user: values.user._id,
        project: projectId,
        organization: currentUser.organization,
        state: TaskState.Active,
        attachments: [],
        estimate: values.estimate ? +values.estimate : null,
        emergency: false,
        createdAt: dateToISO(new Date())
      })

      afterSubmit()
      onClose()
    }
  })

  return (
    <>
      <Button
        onClick={() => setShowCreateForm(true)}
        startIcon={<Add />}
        sx={sx}
      >
        Add Task
      </Button>

      <DialogForm
        title="New Task"
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
          <RestAutocompleteInput
            label="User"
            restEndpoint={session.user}
            getOptionLabel={(user) => user.email}
            searchProperties={["email"]}
            additionalQueryConditions={[
              {organization: {Equal: currentUser.organization}}
            ]}
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
            label="Estimate (hours)"
            {...makeFormikNumericTextFieldProps(formik, "estimate")}
          />
        </Stack>
      </DialogForm>
    </>
  )
}
