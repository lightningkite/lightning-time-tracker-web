import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel
} from "@mui/material"
import {encodePermissions, parsePermissions} from "hooks/usePermissions"
import React, {ChangeEvent, FC} from "react"
import {camelCaseToTitleCase} from "utils/helpers"

export interface PermissionsInputProps {
  permissions: number
  onChange: (permissions: number) => void
}

export const PermissionsInput: FC<PermissionsInputProps> = (props) => {
  const {permissions, onChange} = props

  const parsedPermissions = parsePermissions(permissions)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const key = event.target.name
    const value = event.target.checked

    onChange(encodePermissions({...parsedPermissions, [key]: value}))
  }

  return (
    <FormControl sx={{m: 3}} component="fieldset" variant="standard">
      <FormLabel component="legend">Individual Permissions</FormLabel>
      <FormGroup>
        {Object.entries(parsedPermissions).map(([permission, value]) => (
          <FormControlLabel
            key={permission}
            name={permission}
            control={<Checkbox checked={value} onChange={handleChange} />}
            label={camelCaseToTitleCase(permission)}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}
