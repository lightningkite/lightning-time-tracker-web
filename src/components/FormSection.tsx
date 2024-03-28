import {Box, Typography} from "@mui/material"
import {Stack} from "@mui/system"
import type {FC, PropsWithChildren} from "react"

interface FormSectionProps {
  title?: string
  titleIcon?: JSX.Element
  subtitle?: string
  disableTopPadding?: boolean
}

export const FormSection: FC<PropsWithChildren<FormSectionProps>> = (props) => {
  const {title, titleIcon, subtitle, disableTopPadding, children} = props

  return (
    <Box pt={disableTopPadding ? undefined : 6} className="hcp-form-section">
      {title && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {title}
          </Typography>
          {titleIcon}
        </Stack>
      )}
      {subtitle && (
        <Typography variant="body2" sx={{color: "#888"}}>
          {subtitle}
        </Typography>
      )}
      <Stack spacing={3} mt={title || subtitle ? 3 : 2}>
        {children}
      </Stack>
    </Box>
  )
}
