import {
  rand,
  randFloat,
  randNumber,
  randRecentDate,
  randSentence,
  randUuid
} from "@ngneat/falso"
import {Project, Task, TimeEntry, User} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import {dateToISO} from "utils/helpers"

dayjs.extend(duration)

export function generateTimeEntries(params: {
  perTaskMonth: number
  months: number
  tasks: Task[]
  users: User[]
}): TimeEntry[] {
  const {perTaskMonth, months, tasks, users} = params

  return Array.from({length: perTaskMonth * tasks.length * months}, () => {
    const task = rand(tasks)
    const user = rand(users.filter((u) => u.organization === task.organization))

    return {
      _id: randUuid(),
      task: task._id,
      taskSummary: task.summary,
      project: task.project,
      projectName: task.projectName,
      organization: task.organization,
      organizationName: task.organizationName,
      user: user._id,
      userName: user.name,
      summary: randSentence(),
      durationMilliseconds: dayjs
        .duration({
          hours: randFloat({min: 0, max: 2})
        })
        .asMilliseconds(),
      date: dateToISO(randRecentDate({days: months * 30}))
    }
  })
}
