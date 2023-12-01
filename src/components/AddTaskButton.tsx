import {
  makeFormikAutocompleteProps,
  makeFormikCheckboxProps,
  makeFormikNumericTextFieldProps,
  makeFormikTextFieldProps,
  RestAutocompleteInput
} from "@lightningkite/mui-lightning-components"
import {Add} from "@mui/icons-material"
import type {ButtonProps, SxProps} from "@mui/material"
import {
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField
} from "@mui/material"
import type {Project, User} from "api/sdk"
import {TaskState} from "api/sdk"
import DialogForm, {shouldPreventSubmission} from "components/DialogForm"
import {useFormik} from "formik"
import type {AnnotatedTask} from "hooks/useAnnotatedEndpoints"
import {useFocus} from "hooks/useFocus"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {makeUserTaskCondition} from "utils/helpers"
import * as yup from "yup"
import {PrioritySlider} from "./PrioritySlider"

const validationSchema = yup.object().shape({
  project: yup.object().required("Required").nullable(),
  summary: yup
    .string()
    .required("Required")
    .max(
      75,
      "This title is too long. Consider putting this information in the description instead."
    ),
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
  const {session, currentUser, currentOrganization} = useContext(AuthContext)
  const permissions = usePermissions()

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
      user: initialUser ?? permissions.canBeAssignedTasks ? currentUser : null,
      project: initialProject ?? null,
      summary: "",
      description: "",
      estimate: "",
      emergency: false,
      priority: 0.0
    },
    validationSchema,
    onSubmit: async (values) => {
      const task = await session.task.insert({
        ...values,
        _id: crypto.randomUUID(),
        user: values.user?._id,
        userName: undefined,
        project: values.project!._id,
        projectName: undefined,
        organization: currentUser.organization,
        organizationName: undefined,
        state:
          initialState ??
          (permissions.canManageAllTasks ? TaskState.Active : TaskState.Hold),
        attachments: [],
        estimate: values.estimate ? +values.estimate : null,
        createdAt: new Date().toISOString(),
        createdBy: currentUser._id,
        creatorName: currentUser.name,
        pullRequestLink: null
      })

      afterSubmit({
        ...task,
        _annotations: {
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
          {!initialUser && permissions.canManageAllTasks && (
            <RestAutocompleteInput
              label="User"
              restEndpoint={session.user}
              getOptionLabel={(user) => user.name || user.email}
              searchProperties={["name", "email"]}
              additionalQueryConditions={[
                makeUserTaskCondition({
                  organization: currentOrganization._id,
                  project: formik.values.project?._id
                })
              ]}
              dependencies={[formik.values.project]}
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

          {permissions.canManageAllTasks && (
            <TextField
              label="Estimate (hours)"
              {...makeFormikNumericTextFieldProps(formik, "estimate")}
            />
          )}
          <PrioritySlider
            onChange={(value) => formik.setFieldValue("priority", value)}
            value={formik.values.priority}
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
