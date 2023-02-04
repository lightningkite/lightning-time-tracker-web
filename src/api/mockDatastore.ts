import {generateOrganizations} from "./mocks/organizations"
import {generateProjects} from "./mocks/projects"
import {generateTasks} from "./mocks/tasks"
import {generateTimeEntries} from "./mocks/timeEntry"
import {generateUsers} from "./mocks/users"
import {Organization, Project, Task, TimeEntry, User} from "./sdk"

export interface MockDatastore {
  users: User[]
  organizations: Organization[]
  projects: Project[]
  tasks: Task[]
  timeEntries: TimeEntry[]
}

export const generateMockDatastore = (): MockDatastore => {
  const organizations = generateOrganizations(1)
  const projects = generateProjects(5, organizations)
  const users = generateUsers(25, organizations)
  const tasks = generateTasks(30, projects, users)
  const timeEntries = generateTimeEntries(5, tasks, users)

  return {users, organizations, projects, tasks, timeEntries}
}
