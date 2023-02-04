import {Alert, AlertTitle, Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import {TimeEntryTable} from "components/TimeEntryTable"
import dayjs from "dayjs"
import React, {FC, useContext, useEffect, useState} from "react"
import {AuthContext} from "utils/context"
import {dateToISO} from "utils/helpers"
import {AddTimeEntryButton} from "./AddTimeEntry"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

export const MyTimeEntries: FC = () => {
  const {session, currentUser} = useContext(AuthContext)

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [weeklyTime, setWeeklyTime] = useState(dayjs.duration(0, "minutes"))

  useEffect(() => {
    session.timeEntry
      .query({
        condition: {
          And: [
            {user: {Equal: currentUser._id}},
            {
              date: {
                GreaterThanOrEqual: dateToISO(dayjs().startOf("week").toDate())
              }
            }
          ]
        }
      })
      .then((timeEntries) => {
        const durations = timeEntries.map((timeEntry) =>
          dayjs.duration(timeEntry.duration)
        )
        const totalTime = durations.reduce(
          (prev, curr) => prev.add(curr),
          dayjs.duration(0, "minutes")
        )
        setWeeklyTime(totalTime)
      })
  }, [refreshTrigger])

  return (
    <Container maxWidth="lg">
      <PageHeader title="My Time Entries">
        <AddTimeEntryButton
          afterSubmit={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </PageHeader>

      <Alert severity="info" sx={{mb: 2}} variant="outlined">
        <AlertTitle>Weekly Time</AlertTitle>
        You have worked {weeklyTime.format("HH:mm")} this week.
      </Alert>

      <TimeEntryTable
        additionalQueryConditions={[{user: {Equal: currentUser._id}}]}
        hiddenColumns={["user"]}
      />
    </Container>
  )
}
