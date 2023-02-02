import {rand, randNumber, randSentence, randUuid} from "@ngneat/falso"
import {Task, TimeEntry, User} from "api/sdk"
import dayjs from "dayjs"
import {dateToISO} from "utils/helpers"

import duration from "dayjs/plugin/duration"

dayjs.extend(duration)

export function generateTimeEntries(
  totalPerTask: number,
  tasks: Task[],
  users: User[]
): TimeEntry[] {
  return Array.from({length: totalPerTask * tasks.length}, () => {
    const task = rand(tasks)
    const user = rand(users.filter((u) => u.organization === task.organization))

    return {
      _id: randUuid(),
      task: task._id,
      project: task.project,
      organization: task.organization,
      user: user._id,
      summary: randSentence(),
      duration: dayjs
        .duration({
          hours: randNumber({min: 0, max: 2}),
          minutes: randNumber({min: 0, max: 59}),
          seconds: randNumber({min: 0, max: 59})
        })
        .toISOString(),
      date: dateToISO(new Date())
    }
  })
}

// dayjs.duration("P1Y2M3DT4H5M6S")
