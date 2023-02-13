import {
  rand,
  randFloat,
  randNumber,
  randRecentDate,
  randSentence,
  randUuid
} from "@ngneat/falso"
import {Task, TimeEntry, User} from "api/sdk"
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
      project: task.project,
      organization: task.organization,
      user: user._id,
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
