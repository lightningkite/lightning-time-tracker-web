import {capitalize} from "@mui/material"
import {
  rand,
  randCatchPhrase,
  randNumber,
  randParagraph,
  randRecentDate,
  randUuid,
  randVerb
} from "@ngneat/falso"
import type {Organization, Project, Task, User} from "api/sdk"
import {TaskState} from "api/sdk"

export function generateTasks(params: {
  perProjectMonth: number
  months: number
  projects: Project[]
  organizations: Organization[]
  users: User[]
}): Task[] {
  const {perProjectMonth, months, projects, users, organizations} = params

  return Array.from(
    {length: perProjectMonth * projects.length * months},
    () => {
      const project = rand(projects)
      const user = rand(
        users.filter((u) => u.organization === project.organization)
      )

      return {
        _id: randUuid(),
        project: project._id,
        projectName: project.name,
        organization: project.organization,
        organizationName: organizations.find(
          (o) => o._id === project.organization
        )?.name,
        user: user._id,
        userName: user.name,
        state: rand(Object.values(TaskState)),
        summary: capitalize(randVerb() + " " + randCatchPhrase().toLowerCase()),
        description: randParagraph(),
        attachments: [],
        estimate: randNumber({min: 0, max: 20}),
        emergency: false,
        priority: 0.0,
        createdAt: randRecentDate({days: months * 30}).toISOString(),
        createdBy: user._id,
        creatorName: user.name,
        pullRequestLink: null
      }
    }
  )
}
