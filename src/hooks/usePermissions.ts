import {useContext} from "react"
import {AuthContext} from "../utils/context"

export function usePermissions() {
  const {
    currentUser: {isSuperUser, permissions}
  } = useContext(AuthContext)

  // Permissions is a number where each bit represents a boolean permission
  const permissionsBits = permissions
    .toString(2)
    .split("")
    .map((bit) => bit === "1")

  const usePermissionsReturn = {
    isSuperUser,
    canViewUsers: isSuperUser || permissionsBits[0],
    canEditUsers: isSuperUser || permissionsBits[1]
  } satisfies Record<string, boolean>

  return usePermissionsReturn
}
