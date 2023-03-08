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

  type PermissionKey = keyof typeof parsedPermissions

  function getChildPermissionKey(
    key: PermissionKey
  ): null | keyof typeof parsedPermissions {
    let otherPermissionKey = key.replace("manage", "")
    // make first char lowercase
    otherPermissionKey =
      otherPermissionKey[0].toLowerCase() + otherPermissionKey.slice(1)

    if (otherPermissionKey in parsedPermissions) {
      return otherPermissionKey as PermissionKey
    }

    return null
  }

  function getParentPermissionKey(
    key: PermissionKey
  ): null | keyof typeof parsedPermissions {
    // make first char uppercase
    let otherPermissionKey = key[0].toUpperCase() + key.slice(1)
    otherPermissionKey = "manage" + otherPermissionKey

    if (otherPermissionKey in parsedPermissions) {
      return otherPermissionKey as PermissionKey
    }

    return null
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const key = event.target.name
    const value = event.target.checked

    const newPermissions = {...parsedPermissions, [key]: value}

    const relativePermissionKey = getChildPermissionKey(key as PermissionKey)

    if (relativePermissionKey && value) {
      newPermissions[relativePermissionKey] = true
    }

    onChange(encodePermissions(newPermissions))
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
            disabled={(() => {
              const parentPermission = getParentPermissionKey(
                permission as PermissionKey
              )
              return !!parentPermission && parsedPermissions[parentPermission]
            })()}
          />
        ))}
      </FormGroup>
    </FormControl>
  )
}
