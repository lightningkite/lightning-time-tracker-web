// Replace this file with the automatically generated lightning server SDK

import {
  AggregateQuery,
  apiCall,
  Condition,
  EntryChange,
  GroupAggregateQuery,
  GroupCountQuery,
  MassModification,
  Modification,
  Path,
  Query
} from "@lightningkite/lightning-server-simplified"

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  birthday: string
  profilePic?: string
  createdAt: string
  modifiedAt: string
}

export interface EmailPinLogin {
  email: string
  pin: string
}

export interface HealthStatus {
  level: Level
  checkedAt: string
  additionalMessage: string | null | undefined
}
export enum Level {
  OK = "OK",
  WARNING = "WARNING",
  URGENT = "URGENT",
  ERROR = "ERROR"
}
export interface Memory {
  max: number
  total: number
  free: number
  systemAllocated: number
  usage: number
}
export interface ServerHealth {
  serverId: string
  version: string
  memory: Memory
  features: Record<string, HealthStatus>
  loadAverageCpu: number
}

export interface UploadInformation {
  uploadUrl: string
  futureCallToken: string
}

export interface Api {
  readonly auth: {
    refreshToken(userToken: string): Promise<string>
    getSelf(userToken: string): Promise<User>
    emailLoginLink(input: string): Promise<void>
    emailPINLogin(input: EmailPinLogin): Promise<string>
  }

  readonly user: {
    default(): Promise<User>
    query(
      input: Query<User>,
      userToken: string,
      files?: Record<Path<Query<User>>, File>
    ): Promise<Array<User>>
    detail(id: string, userToken: string): Promise<User>
    insertBulk(
      input: Array<User>,
      userToken: string,
      files?: Record<Path<Array<User>>, File>
    ): Promise<Array<User>>
    insert(
      input: User,
      userToken: string,
      files?: Record<Path<User>, File>
    ): Promise<User>
    upsert(
      id: string,
      input: User,
      userToken: string,
      files?: Record<Path<User>, File>
    ): Promise<User>
    bulkReplace(
      input: Array<User>,
      userToken: string,
      files?: Record<Path<Array<User>>, File>
    ): Promise<Array<User>>
    replace(
      id: string,
      input: User,
      userToken: string,
      files?: Record<Path<User>, File>
    ): Promise<User>
    bulkModify(
      input: MassModification<User>,
      userToken: string,
      files?: Record<Path<MassModification<User>>, File>
    ): Promise<number>
    modifyWithDiff(
      id: string,
      input: Modification<User>,
      userToken: string,
      files?: Record<Path<Modification<User>>, File>
    ): Promise<EntryChange<User>>
    modify(
      id: string,
      input: Modification<User>,
      userToken: string,
      files?: Record<Path<Modification<User>>, File>
    ): Promise<User>
    bulkDelete(
      input: Condition<User>,
      userToken: string,
      files?: Record<Path<Condition<User>>, File>
    ): Promise<number>
    delete(id: string, userToken: string): Promise<void>
    count(
      input: Condition<User>,
      userToken: string,
      files?: Record<Path<Condition<User>>, File>
    ): Promise<number>
    groupCount(
      input: GroupCountQuery<User>,
      userToken: string,
      files?: Record<Path<GroupCountQuery<User>>, File>
    ): Promise<Record<string, number>>
    aggregate(
      input: AggregateQuery<User>,
      userToken: string,
      files?: Record<Path<AggregateQuery<User>>, File>
    ): Promise<number | null | undefined>
    groupAggregate(
      input: GroupAggregateQuery<User>,
      userToken: string,
      files?: Record<Path<GroupAggregateQuery<User>>, File>
    ): Promise<Record<string, number | null | undefined>>
  }
}

export class UserSession {
  constructor(public api: Api, public userToken: string) {}

  readonly auth = {
    refreshToken: (): Promise<string> => {
      return this.api.auth.refreshToken(this.userToken)
    },
    getSelf: (): Promise<User> => {
      return this.api.auth.getSelf(this.userToken)
    },
    emailLoginLink: (input: string): Promise<void> => {
      return this.api.auth.emailLoginLink(input)
    },
    emailPINLogin: (input: EmailPinLogin): Promise<string> => {
      return this.api.auth.emailPINLogin(input)
    }
  }

  readonly user = {
    default: (): Promise<User> => Promise.reject(new Error("Not implemented")),
    query: (input: Query<User>): Promise<Array<User>> => {
      return this.api.user.query(input, this.userToken)
    },
    detail: (id: string): Promise<User> => {
      return this.api.user.detail(id, this.userToken)
    },
    insertBulk: (input: Array<User>): Promise<Array<User>> => {
      return this.api.user.insertBulk(input, this.userToken)
    },
    insert: (input: User): Promise<User> => {
      return this.api.user.insert(input, this.userToken)
    },
    upsert: (id: string, input: User): Promise<User> => {
      return this.api.user.upsert(id, input, this.userToken)
    },
    bulkReplace: (input: Array<User>): Promise<Array<User>> => {
      return this.api.user.bulkReplace(input, this.userToken)
    },
    replace: (id: string, input: User): Promise<User> => {
      return this.api.user.replace(id, input, this.userToken)
    },
    bulkModify: (input: MassModification<User>): Promise<number> => {
      return this.api.user.bulkModify(input, this.userToken)
    },
    modifyWithDiff: (
      id: string,
      input: Modification<User>
    ): Promise<EntryChange<User>> => {
      return this.api.user.modifyWithDiff(id, input, this.userToken)
    },
    modify: (id: string, input: Modification<User>): Promise<User> => {
      return this.api.user.modify(id, input, this.userToken)
    },
    bulkDelete: (input: Condition<User>): Promise<number> => {
      return this.api.user.bulkDelete(input, this.userToken)
    },
    delete: (id: string): Promise<void> => {
      return this.api.user.delete(id, this.userToken)
    },
    count: (input: Condition<User>): Promise<number> => {
      return this.api.user.count(input, this.userToken)
    },
    groupCount: (
      input: GroupCountQuery<User>
    ): Promise<Record<string, number>> => {
      return this.api.user.groupCount(input, this.userToken)
    },
    aggregate: (
      input: AggregateQuery<User>
    ): Promise<number | null | undefined> => {
      return this.api.user.aggregate(input, this.userToken)
    },
    groupAggregate: (
      input: GroupAggregateQuery<User>
    ): Promise<Record<string, number | null | undefined>> => {
      return this.api.user.groupAggregate(input, this.userToken)
    }
  }
}

export class LiveApi implements Api {
  public constructor(
    public httpUrl: string,
    public socketUrl: string = httpUrl,
    public extraHeaders: Record<string, string> = {}
  ) {}

  readonly auth = {
    refreshToken: (userToken: string): Promise<string> => {
      return apiCall(`${this.httpUrl}/auth/refresh-token`, undefined, {
        method: "GET",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    getSelf: (userToken: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/auth/self`, undefined, {
        method: "GET",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    emailLoginLink: (input: string): Promise<void> => {
      return apiCall(`${this.httpUrl}/auth/login-email`, input, {
        method: "POST"
      }).then((x) => undefined)
    },
    emailPINLogin: (input: EmailPinLogin): Promise<string> => {
      return apiCall(`${this.httpUrl}/auth/login-email-pin`, input, {
        method: "POST"
      }).then((x) => x.json())
    }
  }

  readonly user = {
    default: (userToken?: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest/default`, undefined, {
        method: "GET",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    query: (input: Query<User>, userToken?: string): Promise<Array<User>> => {
      return apiCall(`${this.httpUrl}/user/rest/query`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    detail: (id: string, userToken?: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}`, undefined, {
        method: "GET",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    insertBulk: (
      input: Array<User>,
      userToken?: string
    ): Promise<Array<User>> => {
      return apiCall(`${this.httpUrl}/user/rest/bulk`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    insert: (input: User, userToken?: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    upsert: (id: string, input: User, userToken?: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    bulkReplace: (
      input: Array<User>,
      userToken?: string
    ): Promise<Array<User>> => {
      return apiCall(`${this.httpUrl}/user/rest`, input, {
        method: "PUT",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    replace: (id: string, input: User, userToken?: string): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}`, input, {
        method: "PUT",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    bulkModify: (
      input: MassModification<User>,
      userToken?: string
    ): Promise<number> => {
      return apiCall(`${this.httpUrl}/user/rest/bulk`, input, {
        method: "PATCH",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    modifyWithDiff: (
      id: string,
      input: Modification<User>,
      userToken?: string
    ): Promise<EntryChange<User>> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}/delta`, input, {
        method: "PATCH",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    modify: (
      id: string,
      input: Modification<User>,
      userToken?: string
    ): Promise<User> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}`, input, {
        method: "PATCH",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    bulkDelete: (
      input: Condition<User>,
      userToken?: string
    ): Promise<number> => {
      return apiCall(`${this.httpUrl}/user/rest/bulk-delete`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    delete: (id: string, userToken?: string): Promise<void> => {
      return apiCall(`${this.httpUrl}/user/rest/${id}`, undefined, {
        method: "DELETE",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((_x) => undefined)
    },
    count: (input: Condition<User>, userToken?: string): Promise<number> => {
      return apiCall(`${this.httpUrl}/user/rest/count`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    groupCount: (
      input: GroupCountQuery<User>,
      userToken?: string
    ): Promise<Record<string, number>> => {
      return apiCall(`${this.httpUrl}/user/rest/group-count`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    aggregate: (
      input: AggregateQuery<User>,
      userToken?: string
    ): Promise<number | null | undefined> => {
      return apiCall(`${this.httpUrl}/user/rest/aggregate`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    },
    groupAggregate: (
      input: GroupAggregateQuery<User>,
      userToken?: string
    ): Promise<Record<string, number | null | undefined>> => {
      return apiCall(`${this.httpUrl}/user/rest/group-aggregate`, input, {
        method: "POST",
        headers: userToken
          ? {...this.extraHeaders, Authorization: `Bearer ${userToken}`}
          : this.extraHeaders
      }).then((x) => x.json())
    }
  }
}
