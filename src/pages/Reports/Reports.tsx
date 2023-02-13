import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import {Dayjs} from "dayjs"
import React, {FC, useState} from "react"
import {DateRangeSelector} from "./DateRangeSelector"
import {ProjectReport} from "./ProjectReport"

const Reports: FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>()

  return (
    <Container maxWidth="md">
      <PageHeader title="Reports">
        <DateRangeSelector setDateRange={setDateRange} />
      </PageHeader>

      {dateRange && <ProjectReport dateRange={dateRange} />}
    </Container>
  )
}

export default Reports
