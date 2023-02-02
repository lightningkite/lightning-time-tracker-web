import {rand, randEmail, randFullName, randUuid} from "@ngneat/falso"
import {Organization, User} from "api/sdk"
import {dateToISO} from "utils/helpers"

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
        name: randFullName(),
        email: randEmail(),
        organization,
        currentTask: null,
        limitToProjects: null,
        isSuperUser: true,
        termsAgreed: dateToISO(new Date())
      }
    }
  )
}
