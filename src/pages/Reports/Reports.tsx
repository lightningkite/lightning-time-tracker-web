import {Container} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useState} from "react"
import {DateRange, DateRangeSelector} from "./DateRangeSelector"
import {ProjectReport} from "./ProjectReport"

const Reports: FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>()

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
