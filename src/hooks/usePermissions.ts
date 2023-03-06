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
    .reverse()

  const usePermissionsReturn = {
    isSuperUser,
    manageProjects: !!permissionsBits.at(1),
    tasks: !!permissionsBits.at(2),
    manageTasks: !!permissionsBits.at(3),
    timeEntries: !!permissionsBits.at(4),
    manageTimeEntries: !!permissionsBits.at(5),
    comments: !!permissionsBits.at(7),
    manageComments: !!permissionsBits.at(8)
  } satisfies Record<string, boolean>

  return usePermissionsReturn
}
