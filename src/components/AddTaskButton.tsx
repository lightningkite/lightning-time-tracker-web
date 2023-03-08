import {
  makeFormikAutocompleteProps,
  makeFormikCheckboxProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import {
  Button,
  ButtonProps,
  Checkbox,
  FormControlLabel,
  Stack,
  SxProps,
  TextField
} from "@mui/material"
import {Project, TaskState, User} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import {useFormik} from "formik"
import {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {useFocus} from "hooks/useFocus"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import * as yup from "yup"

const validationSchema = yup.object().shape({
  user: yup.object().required("Required").nullable(),
  project: yup.object().required("Required").nullable(),
  summary: yup.string().required("Required"),
  estimate: yup.number().integer().min(0).nullable()
})

export interface AddTaskButtonProps extends ButtonProps {
  afterSubmit: (task: AnnotatedTask) => void
  state?: TaskState
  project?: Project
  user?: User
  sx?: SxProps
}

export const AddTaskButton: FC<AddTaskButtonProps> = (props) => {
  const {
    afterSubmit,
    project: initialProject,
    user: initialUser,
    state: initialState,
    ...rest
  } = props
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
      user: initialUser ?? currentUser,
      project: initialProject ?? null,
      summary: "",
      description: "",
      estimate: "",
      emergency: false
    },
    validationSchema,
    onSubmit: async (values) => {
      const task = await session.task.insert({
        ...values,
        _id: crypto.randomUUID(),
        user: values.user._id,
        userName: undefined,
        project: (values.project as Project)._id,
        projectName: undefined,
        organization: currentUser.organization,
        organizationName: undefined,
        state: initialState ?? TaskState.Active,
        attachments: [],
        estimate: values.estimate ? +values.estimate : null,
        emergency: false,
        createdAt: new Date().toISOString()
      })

      afterSubmit({
        ...task,
        annotations: {
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
        {...rest}
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
          {!initialUser && (
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
          )}

          {!initialProject && (
            <RestAutocompleteInput
              label="Project"
              restEndpoint={session.project}
              getOptionLabel={(project) => project.name}
              searchProperties={["name"]}
              additionalQueryConditions={[
                {organization: {Equal: currentUser.organization}}
              ]}
              {...makeFormikAutocompleteProps(formik, "project")}
            />
          )}

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

          <FormControlLabel
            control={
              <Checkbox {...makeFormikCheckboxProps(formik, "emergency")} />
            }
            label="Emergency"
          />
        </Stack>
      </DialogForm>
    </>
  )
}
