import {type UserRole} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "../utils/context"

export function usePermissions() {
  const {
    currentUser: {role, isSuperUser}
  } = useContext(AuthContext)

  function isA(...roles: `${UserRole}`[]) {
    return !!role && roles.includes(role)
  }

  // Assign `false` to a permission if only super users and owners can do it
  const usePermissionsReturn = {
    // USERS
    canManageAllUsers: false as boolean,
    canViewIndividualUsers: isA("InternalTeamMember", "Contractor"),

    // TIME
    canSubmitTime: isA("InternalTeamMember", "Contractor"),
    canManageAllTime: false as boolean,
    canViewIndividualTimeEntries: isA("InternalTeamMember", "Contractor"),

    // PROJECTS
    canManageAllProjects: isA("InternalTeamMember"),
    canViewProjectsTab: isA("InternalTeamMember"),

    // TASKS
    canDeliverTasks: isA("Client", "ClientTesting"),
    canReportNewTasks: true as boolean,
    canManageAllTasks: isA("InternalTeamMember"),
    canBeAssignedTasks: isA(
      "InternalTeamMember",
      "ExternalTeamMember",
      "Contractor"
    ),
    doesCareAboutPRs: isA(
      "InternalTeamMember",
      "Contractor",
      "ExternalTeamMember"
    ),
    canViewTesting: isA(
      "Owner",
      "InternalTeamMember",
      "Contractor",
      "Client",
      "ClientNoBilling",
      "ExternalTeamMember"
    ),

    // REPORTS
    canViewInternalReports: isA("InternalTeamMember"),
    canViewClientReports: isA("Client")
  } satisfies Record<string, boolean>

  // Super users and owners can do everything
  if (isSuperUser || isA("Owner")) {
    Object.keys(usePermissionsReturn).forEach((key) => {
      usePermissionsReturn[key as keyof typeof usePermissionsReturn] = true
    })
  }

  return usePermissionsReturn
}
