import {rand, randFirstName, randLastName, randUuid} from "@ngneat/falso"
import {Organization, User} from "api/sdk"

export function generateUsers(
  totalPerOrganization: number,
  organizations: Organization[]
): User[] {
  return Array.from(
    {length: totalPerOrganization * organizations.length},
    () => {
      const organization = rand(organizations)._id
      return {
        _id: randUuid(),
        email: randFirstName().toLowerCase() + "@lightningkite.com",
        name: `${randFirstName()} ${randLastName()}`,
        organization,
        currentTask: null,
        isSuperUser: true,
        active: true,
        projectFavorites: [],
        webPreferences: "",
        limitToProjects: null,
        role: null
      }
    }
  )
}
