import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import dayjs from "dayjs"
import React, {FC} from "react"
import {ProjectsTasks} from "./ProjectsTasks"

import duration from "dayjs/plugin/duration"
dayjs.extend(duration)

const Dashboard: FC = () => {
  // const [runningSeconds, setRunningSeconds] = useState(0)

  // const updateRunningSeconds = () => {
  //   const totalSeconds = Object.values(timers).reduce(
  //     (acc, timer) => acc + getTimerSeconds(timer),
  //     0
  //   )
  //   setRunningSeconds(totalSeconds)
  // }

  // useEffect(() => {
  //   updateRunningSeconds()

  //   const anyTimersRunning = Object.values(timers).some(
  //     (timer) => !!timer.lastStarted
  //   )
  //   if (!anyTimersRunning) return

  //   const interval = setInterval(updateRunningSeconds, 1000)
  //   return () => clearInterval(interval)
  // }, [timers])

  return (
    <Container maxWidth="md">
      <PageHeader title="Dashboard">
        {/* <Typography variant="h2" sx={{mr: 1}}>
          {dayjs.duration(runningSeconds, "second").format("HH:mm:ss")}
        </Typography> */}
      </PageHeader>
      <ProjectsTasks />
    </Container>
  )
}

export default Dashboard
