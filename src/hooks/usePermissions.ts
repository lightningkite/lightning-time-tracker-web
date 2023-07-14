import {UserRole} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "../utils/context"

export function usePermissions() {
  const {
    currentUser: {role, isSuperUser, limitToProjects}
  } = useContext(AuthContext)

  function isA(...roles: UserRole[]) {
    return !!role && roles.includes(role)
  }

  // Assign `false` to a permission if only super users and owners can do it
  const usePermissionsReturn = {
    // USERS
    canManageAllUsers: false as boolean,
    canViewIndividualUsers: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor
    ),

    // TIME
    canSubmitTime: isA(UserRole.InternalTeamMember, UserRole.Contractor),
    canManageAllTime: false as boolean,
    canViewIndividualTimeEntries: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor
    ),

    // PROJECTS
    canManageAllProjects: isA(UserRole.InternalTeamMember),
    canViewProjectsTab:
      isA(UserRole.InternalTeamMember) || !!limitToProjects?.length,

    // TASKS
    canDeliverTasks: isA(UserRole.Client),
    canReportNewTasks: true as boolean,
    canManageAllTasks: isA(UserRole.InternalTeamMember),
    canBeAssignedTasks: isA(
      UserRole.InternalTeamMember,
      UserRole.ExternalTeamMember,
      UserRole.Contractor
    ),
    doesCareAboutPRs: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor,
      UserRole.ExternalTeamMember
    ),

    // REPORTS
    canViewInternalReports: isA(UserRole.InternalTeamMember),
    canViewClientReports: isA(UserRole.Client)
  } satisfies Record<string, boolean>

  // Super users and owners can do everything
  if (isSuperUser || isA(UserRole.Owner)) {
    Object.keys(usePermissionsReturn).forEach((key) => {
      usePermissionsReturn[key as keyof typeof usePermissionsReturn] = true
    })
  }

  return usePermissionsReturn
}
