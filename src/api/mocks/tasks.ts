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
import {Project, Task, TaskState, User} from "api/sdk"

export function generateTasks(params: {
  perProjectMonth: number
  months: number
  projects: Project[]
  users: User[]
}): Task[] {
  const {perProjectMonth, months, projects, users} = params

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
        organization: project.organization,
        user: user._id,
        state: rand(Object.values(TaskState)),
        summary: capitalize(randVerb() + " " + randCatchPhrase().toLowerCase()),
        description: randParagraph(),
        attachments: [],
        estimate: randNumber({min: 0, max: 20}),
        emergency: false,
        createdAt: randRecentDate({days: months * 30}).toISOString()
      }
    }
  )
}
