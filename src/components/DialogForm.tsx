import {Close} from "@mui/icons-material"
import {LoadingButton} from "@mui/lab"
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  IconButton,
  Tooltip
} from "@mui/material"
import {useFormik} from "formik"
import React, {FC, useState} from "react"

export interface DialogFormProps extends DialogProps {
  title: string
  submitLabel?: string
  cancelLabel?: string
  instructions?: string
  onClose: () => void
  onSubmit: () => Promise<void>
  disableSubmitBtn?: boolean
}

export const DialogForm: FC<DialogFormProps> = (props) => {
  const {
    title,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    fullWidth = true,
    children,
    instructions,
    onSubmit,
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
  formik: ReturnType<typeof useFormik<any>>
): boolean {
  return (!formik.submitCount && !formik.dirty) || !formik.isValid
}
