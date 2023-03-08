import {useContext} from "react"
import {AuthContext} from "../utils/context"

export function usePermissions() {
  const {
    currentUser: {permissions, isSuperUser, limitToProjects}
  } = useContext(AuthContext)

  const parsedPermissions = parsePermissions(permissions)

  const usePermissionsReturn = {
    readSomeProjects: isSuperUser || !!limitToProjects?.length,
    manageUsers: isSuperUser || parsedPermissions.manageUsers,
    manageProjects: isSuperUser || parsedPermissions.manageProjects,
    tasks: isSuperUser || parsedPermissions.tasks,
    manageTasks: isSuperUser || parsedPermissions.manageTasks,
    timeEntries: isSuperUser || parsedPermissions.timeEntries,
    manageTimeEntries: isSuperUser || parsedPermissions.manageTimeEntries,
    comments: isSuperUser || parsedPermissions.comments,
    manageComments: isSuperUser || parsedPermissions.manageComments
  } satisfies Record<string, boolean>

  return usePermissionsReturn
}

export interface PermissionsSet {
  manageUsers: boolean
  manageProjects: boolean
  tasks: boolean
  manageTasks: boolean
  timeEntries: boolean
  manageTimeEntries: boolean
  comments: boolean
  manageComments: boolean
  canCreateTasks: boolean
}

export function parsePermissions(permissions: number) {
  return {
    manageUsers: !!(permissions & 1),
    manageProjects: !!(permissions & 2),
    tasks: !!(permissions & 4),
    manageTasks: !!(permissions & 8),
    timeEntries: !!(permissions & 16),
    manageTimeEntries: !!(permissions & 32),
    comments: !!(permissions & 128),
    manageComments: !!(permissions & 256),
    canCreateTasks: !!(permissions & 512)
  }
}

export function encodePermissions(permissions: PermissionsSet) {
  return (
    (permissions.manageUsers ? 1 : 0) +
    (permissions.manageProjects ? 2 : 0) +
    (permissions.tasks ? 4 : 0) +
    (permissions.manageTasks ? 8 : 0) +
    (permissions.timeEntries ? 16 : 0) +
    (permissions.manageTimeEntries ? 32 : 0) +
    (permissions.comments ? 128 : 0) +
    (permissions.manageComments ? 256 : 0) +
    (permissions.canCreateTasks ? 512 : 0)
  )
}
