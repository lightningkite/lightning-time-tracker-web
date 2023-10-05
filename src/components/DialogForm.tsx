import {Close} from "@mui/icons-material"
import {LoadingButton} from "@mui/lab"
import type {DialogProps} from "@mui/material"
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from "@mui/material"
import type {useFormik} from "formik"
import type {FC} from "react"
import React, {useState} from "react"
import {AutoLoadingButton} from "./AutoLoadingButton"

export interface DialogFormProps extends DialogProps {
  title: string
  submitLabel?: string
  cancelLabel?: string
  deleteLabel?: string
  instructions?: string
  onClose: () => void
  onSubmit: () => Promise<unknown>
  onDelete?: () => Promise<unknown>
  disableSubmitBtn?: boolean
}

export const DialogForm: FC<DialogFormProps> = (props) => {
  const {
    title,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    deleteLabel = "Delete",
    fullWidth = true,
    children,
    instructions,
    onSubmit,
    onDelete,
    disableSubmitBtn = false,
    onClose,
    ...rest
  } = props

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleClose = () => {
    setError("")
    setIsSubmitting(false)
    onClose()
  }

  const handleOnSubmit = () => {
    setError("")
    setIsSubmitting(true)

    onSubmit()
      .then(handleClose)
      .catch((e) => {
        console.error(e)
        setError(e?.message || "Error submitting")
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-modal-title"
      fullWidth={fullWidth}
      {...rest}
      onClick={(e) => e.stopPropagation()}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleOnSubmit()
        }}
      >
        <DialogTitle id="customized-modal-title">
          {title}

          <Tooltip title="Close">
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <DialogContent sx={{pb: 2}}>
          {instructions && (
            <DialogContentText>{instructions}</DialogContentText>
          )}

          <Box my={2}>{children}</Box>

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>

        <DialogActions>
          {onDelete && (
            <AutoLoadingButton
              color="error"
              disableElevation
              onClick={() =>
                onDelete()
                  .then(handleClose)
                  .catch(() => setError("Error deleting"))
              }
              sx={{mr: "auto"}}
            >
              {deleteLabel}
            </AutoLoadingButton>
          )}

          <Button onClick={handleClose}>{cancelLabel}</Button>

          <LoadingButton
            loading={isSubmitting}
            color="primary"
            variant="contained"
            disableElevation
            disabled={disableSubmitBtn}
            type="submit"
          >
            {submitLabel}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default DialogForm

export function shouldPreventSubmission(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formik: ReturnType<typeof useFormik<any>>
): boolean {
  return (!formik.submitCount && !formik.dirty) || !formik.isValid
}
