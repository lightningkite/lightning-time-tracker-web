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

  const usePermissionsReturn = {
    canBeAssignedTasks: isA(
      UserRole.InternalTeamMember,
      UserRole.ExternalTeamMember,
      UserRole.Contractor
    ),

    canSubmitTime: isA(UserRole.InternalTeamMember, UserRole.Contractor),

    canManageAllTime: false as boolean,

    canManageAllTasks: isA(UserRole.InternalTeamMember),

    canReportNewTasks: true,

    canViewInternalReports: isA(UserRole.InternalTeamMember),

    canViewClientReports: isA(UserRole.Client),

    canManageAllUsers: false as boolean,

    canManageAllProjects: isA(UserRole.InternalTeamMember),

    canViewProjectsTab:
      isA(UserRole.InternalTeamMember) || !!limitToProjects?.length,

    canViewIndividualTimeEntries: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor
    ),

    canViewIndividualUsers: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor
    ),

    doesCareAboutPRs: isA(
      UserRole.InternalTeamMember,
      UserRole.Contractor,
      UserRole.ExternalTeamMember
    )
  } satisfies Record<string, boolean>

  if (isSuperUser || isA(UserRole.Owner)) {
    Object.keys(usePermissionsReturn).forEach((key) => {
      usePermissionsReturn[key as keyof typeof usePermissionsReturn] = true
    })
  }

  return usePermissionsReturn
}
