import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Box, Container, Tab} from "@mui/material"
import PageHeader from "components/PageHeader"
import React, {FC, useState} from "react"
import {HoursByDateReport} from "./HoursByDateReport"
import {HoursByProjectReport} from "./HoursByProjectReport"
import {DateRange, DateRangeSelector} from "./ReportFilters"
import {RevenueReport} from "./RevenueReport"

export interface ReportFilterValues {
  dateRange: DateRange | null
  users: string[] | null
  projects: string[] | null
}

export interface ReportProps {
  reportFilterValues: ReportFilterValues
}

const ReportsPage: FC = () => {
  const [reportFilterValues, setReportFilterValues] =
    useState<ReportFilterValues>()
  const [value, setValue] = useState("1")

  return (
    <Container maxWidth="xl">
      <PageHeader title="Reports" />

      <DateRangeSelector setReportFilterValues={setReportFilterValues} />

      {reportFilterValues && (
        <>
          <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: "divider", mt: 2}}>
              <TabList onChange={(_e, newValue) => setValue(newValue)}>
                <Tab label="Revenue" value="1" />
                <Tab label="Hours by Date" value="2" />
                <Tab label="Hours by Project" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1" sx={{px: 0}}>
              <RevenueReport reportFilterValues={reportFilterValues} />
            </TabPanel>
            <TabPanel value="2" sx={{px: 0}}>
              <HoursByDateReport reportFilterValues={reportFilterValues} />
            </TabPanel>
            <TabPanel value="3" sx={{px: 0}}>
              <HoursByProjectReport reportFilterValues={reportFilterValues} />
            </TabPanel>
          </TabContext>
        </>
      )}
    </Container>
  )
}

export default ReportsPage
