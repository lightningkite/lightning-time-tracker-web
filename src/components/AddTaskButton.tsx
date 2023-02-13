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
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {AnnotatedTask} from "utils/useAnnotatedEndpoints"
import {useFocus} from "utils/useFocus"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  user: yup.object().required("Required").nullable(),
  summary: yup.string().required("Required"),
  estimate: yup.number().integer().min(0).nullable()
})

export interface AddTaskButtonProps {
  afterSubmit: (task: AnnotatedTask) => void
  projectId: string
  sx?: SxProps
}

export const AddTaskButton: FC<AddTaskButtonProps> = (props) => {
  const {afterSubmit, projectId, sx} = props
  const {session, currentUser} = useContext(AuthContext)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [inputRef, setInputFocus] = useFocus()

  function onClose() {
    setShowCreateForm(false)
    formik.resetForm()
  }

  useEffect(() => {
    setTimeout(setInputFocus, 100)
  }, [showCreateForm])

  const formik = useFormik({
    initialValues: {
      user: currentUser,
      summary: "",
      description: "",
      estimate: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      const task = await session.task.insert({
        ...values,
        _id: crypto.randomUUID(),
        user: values.user._id,
        project: projectId,
        organization: currentUser.organization,
        state: TaskState.Active,
        attachments: [],
        estimate: values.estimate ? +values.estimate : null,
        emergency: false,
        createdAt: new Date().toISOString()
      })

      afterSubmit({
        ...task,
        annotations: {
          user: values.user,
          totalTaskHours: 0
        }
      })
      onClose()
    }
  })

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          setShowCreateForm(true)
        }}
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
            getOptionLabel={(user) => user.name || user.email}
            searchProperties={["name", "email"]}
            additionalQueryConditions={[
              {organization: {Equal: currentUser.organization}}
            ]}
            {...makeFormikAutocompleteProps(formik, "user")}
          />

          <TextField
            label="Summary"
            inputRef={inputRef}
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
