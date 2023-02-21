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
  const users = generateUsers(7, organizations)
  const tasks = generateTasks({
    perProjectMonth: 10,
    months: 3,
    projects,
    users,
    organizations
  })
  const timeEntries = generateTimeEntries({
    perTaskMonth: 7,
    months: 3,
    tasks,
    users
  })

  return {users, organizations, projects, tasks, timeEntries}
}
