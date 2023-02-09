import {rand, randCompanyName, randPastDate, randUuid} from "@ngneat/falso"
import {Organization, Project} from "api/sdk"

export function generateProjects(
  totalPerOrganization: number,
  organizations: Organization[]
): Project[] {
  return Array.from(
    {length: totalPerOrganization * organizations.length},
    () => {
      return {
        _id: randUuid(),
        name: randCompanyName(),
        organization: rand(organizations)._id,
        rate: 100,
        createdAt: randPastDate().toISOString()
      }
    }
  )
}
