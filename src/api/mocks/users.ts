import {rand, randEmail, randFullName, randUuid} from "@ngneat/falso"
import {Organization, Task, User} from "api/sdk"
import {dateToISO} from "utils/helpers"

export function generateUsers(
  total: number,
  organizations: Organization[],
  tasks: Task[]
): User[] {
  return Array.from({length: total}, () => {
    const organization = rand(organizations)._id
    return {
      _id: randUuid(),
      name: randFullName(),
      email: randEmail(),
      organization,
      currentTask: rand(tasks.filter((t) => t.organization === organization))
        ._id,
      limitToProjects: null,
      isSuperUser: true,
      termsAgreed: dateToISO(new Date())
    }
  })
}
