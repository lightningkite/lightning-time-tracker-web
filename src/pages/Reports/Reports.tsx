import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Box, Container, Tab} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useState} from "react"
import {DateRange, DateRangeSelector} from "./DateRangeSelector"
import {ProjectReport} from "./ProjectReport"

const Reports: FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>()
  const [value, setValue] = useState("1")

  return (
    <Container maxWidth="md">
      <PageHeader title="Reports">
        <DateRangeSelector setDateRange={setDateRange} />
      </PageHeader>

      {dateRange && (
        <>
          <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: "divider"}}>
              <TabList onChange={(_e, newValue) => setValue(newValue)}>
                <Tab label="Projects" value="1" />
                <Tab label="Item Two" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{px: 0}}>
              <ProjectReport dateRange={dateRange} />
            </TabPanel>
            <TabPanel value="2" sx={{px: 0}}>
              Item Two
            </TabPanel>
          </TabContext>
        </>
      )}
    </Container>
  )
}

export default Reports
