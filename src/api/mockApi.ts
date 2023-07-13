import {mockRestEndpointFunctions} from "@lightningkite/lightning-server-simplified"
import {rand} from "@ngneat/falso"
import {LocalStorageKey} from "utils/constants"
import type {MockDatastore} from "./mockDatastore"
import {generateMockDatastore} from "./mockDatastore"
import type {
  Api,
  Comment,
  EmailPinLogin,
  Organization,
  Project,
  ServerHealth,
  Task,
  TimeEntry,
  Timer,
  UploadInformation,
  User
} from "./sdk"

let myUser: User | null = null

export class MockApi implements Api {
  mockDatastore: MockDatastore = generateMockDatastore()

  public constructor(
    public httpUrl: string = "mock",
    public socketUrl: string = httpUrl
  ) {
    myUser = rand(this.mockDatastore.users)
  }

  uploadFileForRequest(): Promise<UploadInformation> {
    throw new Error("Method not implemented.")
  }

  readonly user = {
    ...mockRestEndpointFunctions<User>(this.mockDatastore.users, "user"),
    addProjects(): Promise<User> {
      return Promise.reject()
    },
    removeProjects(): Promise<User> {
      return Promise.reject()
    },
    addPermissions(): Promise<User> {
      return Promise.reject()
    },
    removePermissions(): Promise<User> {
      return Promise.reject()
    }
  }

  readonly organization = mockRestEndpointFunctions<Organization>(
    this.mockDatastore.organizations,
    "organization"
  )

  readonly project = mockRestEndpointFunctions<Project>(
    this.mockDatastore.projects,
    "project"
  )

  readonly task = mockRestEndpointFunctions<Task>(
    this.mockDatastore.tasks,
    "task"
  )

  readonly timeEntry = mockRestEndpointFunctions<TimeEntry>(
    this.mockDatastore.timeEntries,
    "timeEntry"
  )

  readonly comment = mockRestEndpointFunctions<Comment>([], "comment")

  readonly timer = mockRestEndpointFunctions<Timer>([], "timer")

  getServerHealth(): Promise<ServerHealth> {
    return Promise.reject()
  }

  listRecentExceptions() {
    return Promise.reject()
  }

  readonly auth = {
    refreshToken: async (): Promise<string> => {
      console.log("refreshToken")
      return "mock-refresh-token"
    },
    getSelf: (userToken: string): Promise<User> => {
      if (!myUser) return Promise.reject()
      console.log("getSelf", myUser)
      return Promise.resolve(myUser)
    },
    anonymousToken: async (): Promise<string> => {
      console.log("anonymousToken")
      return "mock-anonymous-token"
    },
    emailLoginLink: async (email: string): Promise<void> => {
      localStorage.setItem(LocalStorageKey.USER_TOKEN, "mock-user-token")
      console.log("emailLoginLink")
      alert(
        "You are using the mock API and will not receive an email. Refresh the page to log in."
      )
    },
    emailPINLogin: async (input: EmailPinLogin): Promise<string> => {
      localStorage.setItem(LocalStorageKey.USER_TOKEN, "mock-user-token")
      console.log("emailPINLogin", {input})
      return "mock-sso-uuid"
    }
  }
}
