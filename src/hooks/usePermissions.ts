import {useContext} from "react"
import {AuthContext} from "../utils/context"

export function usePermissions() {
  const {
    currentUser: {permissions, isSuperUser}
  } = useContext(AuthContext)

  // Permissions is a number where each bit represents a boolean permission
  const permissionsBits = permissions
    .toString(2)
    .split("")
    .map((bit) => bit === "1")
    .reverse()

  const usePermissionsReturn = {
    manageProjects: isSuperUser || !!permissionsBits.at(1),
    tasks: isSuperUser || !!permissionsBits.at(2),
    manageTasks: isSuperUser || !!permissionsBits.at(3),
    timeEntries: isSuperUser || !!permissionsBits.at(4),
    manageTimeEntries: isSuperUser || !!permissionsBits.at(5),
    comments: isSuperUser || !!permissionsBits.at(7),
    manageComments: isSuperUser || !!permissionsBits.at(8)
  } satisfies Record<string, boolean>

  return usePermissionsReturn
}
