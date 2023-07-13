import {rand, randCompanyName, randPastDate, randUuid} from "@ngneat/falso"
import type {Organization, Project} from "api/sdk"

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
        notes: "",
        rate: 100,
        createdAt: randPastDate().toISOString()
      }
    }
  )
}
