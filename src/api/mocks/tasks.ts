import {capitalize} from "@mui/material"
import {
  rand,
  randCatchPhrase,
  randNumber,
  randParagraph,
  randPastDate,
  randUuid,
  randVerb
} from "@ngneat/falso"
import {Project, Task, TaskState, User} from "api/sdk"

export function generateTasks(
  totalPerProject: number,
  projects: Project[],
  users: User[]
): Task[] {
  return Array.from({length: totalPerProject * projects.length}, () => {
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
      createdAt: randPastDate().toISOString()
    }
  })
}
