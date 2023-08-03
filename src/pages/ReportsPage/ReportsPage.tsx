import {TabContext, TabList, TabPanel} from "@mui/lab"
import {Box, Container, Tab} from "@mui/material"
import type {Project, User} from "api/sdk"
import {UserRole} from "api/sdk"
import PageHeader from "components/PageHeader"
import {usePermissions} from "hooks/usePermissions"
import type {FC} from "react"
import React, {useContext, useState} from "react"
import {AuthContext} from "utils/context"
import {HoursByDateReport} from "./HoursByDateReport"
import {HoursByProjectReport} from "./HoursByProjectReport"
import type {DateRange} from "./ReportFilters"
import ReportFilters from "./ReportFilters"
import {RevenueReport} from "./RevenueReport"
import {TimeEntriesReport} from "./TimeEntriesReport"

export interface ReportFilterValues {
  dateRange: DateRange | null
  users: User[] | null
  projects: Project[] | null
}

export interface ReportProps {
  reportFilterValues: ReportFilterValues
}

const ReportsPage: FC = () => {
  const {currentUser} = useContext(AuthContext)
  const permissions = usePermissions()

  const [reportFilterValues, setReportFilterValues] =
    useState<ReportFilterValues>()
  const [value, setValue] = useState("1")

  const multipleProjects: boolean = (() => {
    const {isSuperUser, role, limitToProjects} = currentUser

    if (isSuperUser) return true
    if (!role) return false

    return (
      [UserRole.Owner, UserRole.InternalTeamMember].includes(role) ||
      (!!limitToProjects && limitToProjects.length > 1)
    )
  })()

  return (
    <Container maxWidth="xl">
      <PageHeader title="Reports" />

      <ReportFilters setReportFilterValues={setReportFilterValues} />

      {reportFilterValues && (
        <>
          <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: "divider", mt: 2}}>
              <TabList onChange={(_e, newValue) => setValue(newValue)}>
                <Tab
                  label={
                    permissions.canViewInternalReports
                      ? "Revenue"
                      : "Estimated Bill"
                  }
                  value="1"
                />
                {permissions.canViewIndividualUsers && (
                  <Tab label="Hours by Date" value="2" />
                )}
                {multipleProjects && permissions.canViewIndividualUsers && (
                  <Tab label="Hours by Project" value="3" />
                )}
                {permissions.canViewIndividualTimeEntries && (
                  <Tab label="Time Entries" value="4" />
                )}
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
            <TabPanel value="4" sx={{px: 0}}>
              <TimeEntriesReport reportFilterValues={reportFilterValues} />
            </TabPanel>
          </TabContext>
        </>
      )}
    </Container>
  )
}

export default ReportsPage
