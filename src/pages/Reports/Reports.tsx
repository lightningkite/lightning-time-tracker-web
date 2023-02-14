import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Box, Container, Tab} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useState} from "react"
import {DateRange, DateRangeSelector} from "./DateRangeSelector"
import {HoursReport} from "./HoursReport"
import {ProjectsReport} from "./ProjectsReport"
import {RevenueReport} from "./RevenueReport"

const Reports: FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>()
  const [value, setValue] = useState("1")

  return (
    <Container maxWidth="xl">
      <PageHeader title="Reports">
        <DateRangeSelector setDateRange={setDateRange} />
      </PageHeader>

      {dateRange && (
        <>
          <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: "divider"}}>
              <TabList onChange={(_e, newValue) => setValue(newValue)}>
                <Tab label="Revenue" value="1" />
                <Tab label="Employee Hours" value="2" />
                <Tab label="Projects" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{px: 0}}>
              <RevenueReport dateRange={dateRange} />
            </TabPanel>
            <TabPanel value="2" sx={{px: 0}}>
              <HoursReport dateRange={dateRange} />
            </TabPanel>
            <TabPanel value="3" sx={{px: 0}}>
              <ProjectsReport dateRange={dateRange} />
            </TabPanel>
          </TabContext>
        </>
      )}
    </Container>
  )
}

export default Reports
