import { Query, MassModification, EntryChange, ListChange, Modification, Condition, GroupCountQuery, AggregateQuery, GroupAggregateQuery, Aggregate, SortPart, DataClassPath, DataClassPathPartial, QueryPartial, apiCall, Path, DeepPartial } from '@lightningkite/lightning-server-simplified'


export interface Attachment {
    name: string
    file: ServerFile
}

export interface Comment {
    _id: UUID
    user: UUID
    userName: string | null | undefined
    task: UUID
    taskSummary: string | null | undefined
    project: UUID
    projectName: string | null | undefined
    organization: UUID
    organizationName: string | null | undefined
    createdAt: Instant
    content: string
}

export interface EmailPinLogin {
    email: string
    pin: string
}

export interface HealthStatus {
    level: Level
    checkedAt: Instant
    additionalMessage: string | null | undefined
}

type Instant = string  // java.time.Instant

export enum Level {
    OK = "OK",
    WARNING = "WARNING",
    URGENT = "URGENT",
    ERROR = "ERROR",
}

type LocalDate = string  // java.time.LocalDate

export interface Memory {
    max: number
    total: number
    free: number
    systemAllocated: number
    usage: number
}

export interface Organization {
    _id: UUID
    name: string
    createdAt: Instant
}

export interface Project {
    _id: UUID
    organization: UUID
    name: string
    rate: number | null | undefined
    notes: string
    createdAt: Instant
    projectTags: Array<string>
}

/**
* A URL referencing a file that the server owns.
**/
type ServerFile = string  // com.lightningkite.lightningdb.ServerFile

export interface ServerHealth {
    serverId: string
    version: string
    memory: Memory
    features: Record<string, HealthStatus>
    loadAverageCpu: number
}

export interface Task {
    _id: UUID
    project: UUID
    projectName: string | null | undefined
    organization: UUID
    organizationName: string | null | undefined
    user: UUID | null | undefined
    userName: string | null | undefined
    state: TaskState
    summary: string
    description: string
    attachments: Array<Attachment>
    estimate: number | null | undefined
    emergency: boolean
    priority: number
    tags: Array<string>
    createdAt: Instant
    createdBy: UUID
    creatorName: string | null | undefined
    pullRequestLinks: Array<string> | null | undefined
}

export enum TaskState {
    Hold = "Hold",
    Ready = "Ready",
    Active = "Active",
    PullRequest = "PullRequest",
    Testing = "Testing",
    Review = "Review",
    HigherReview = "HigherReview",
    FinalReview = "FinalReview",
    Approved = "Approved",
    PartialDelivery1 = "PartialDelivery1",
    PartialDelivery2 = "PartialDelivery2",
    Delivered = "Delivered",
    Cancelled = "Cancelled",
}

export interface TimeEntry {
    _id: UUID
    task: UUID | null | undefined
    taskSummary: string | null | undefined
    project: UUID
    projectName: string | null | undefined
    organization: UUID
    organizationName: string | null | undefined
    user: UUID
    userName: string | null | undefined
    summary: string
    durationMilliseconds: number
    date: LocalDate
}

export interface Timer {
    _id: UUID
    user: UUID
    organization: UUID
    lastStarted: Instant | null | undefined
    accumulatedSeconds: number
    task: UUID | null | undefined
    project: UUID | null | undefined
    summary: string
    date: LocalDate
}

type UUID = string  // java.util.UUID

export interface UploadInformation {
    uploadUrl: string
    futureCallToken: string
}

export interface User {
    _id: UUID
    email: string
    organization: UUID
    name: string
    webPreferences: string
    isSuperUser: boolean
    role: UserRole | null | undefined
    currentTask: UUID | null | undefined
    projectFavorites: Array<UUID>
    limitToProjects: Array<UUID> | null | undefined
    active: boolean
}

export enum UserRole {
    Owner = "Owner",
    InternalTeamMember = "InternalTeamMember",
    Contractor = "Contractor",
    Client = "Client",
    ClientNoBilling = "ClientNoBilling",
    ClientTesting = "ClientTesting",
    ExternalTeamMember = "ExternalTeamMember",
}



export interface Api {
    
     /**
     * Gets the current status of the server
     **/
    getServerHealth(userToken?: string): Promise<ServerHealth>
    
     /**
     * Upload a file to make a request later.  Times out in around 10 minutes.
     **/
    uploadFileForRequest(): Promise<UploadInformation>
    readonly auth: {
        
        /**
        * Creates a new token for the user, which can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]'.
        **/
        refreshToken(userToken: string): Promise<string>
        
        /**
        * Retrieves the user that you currently authenticated as.
        **/
        getSelf(userToken: string): Promise<User>
        
        /**
        * Creates a token for a new, anonymous user.  The token can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]
        **/
        anonymousToken(userToken?: string): Promise<string>
        
        /**
        * Sends a login email to the given address.  The email will contain both a link to instantly log in and a PIN that can be entered to log in.
        **/
        emailLoginLink(input: string): Promise<void>
        
        /**
        * Logs in to the given account with a PIN that was provided in an email sent earlier.  Note that the PIN expires in 15 minutes, and you are only permitted 5 attempts.
        **/
        emailPINLogin(input: EmailPinLogin): Promise<string>
    }
    readonly comment: {
        
        /**
        * Gets a default Comment that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<Comment>
        
        /**
        * Gets a list of Comments that match the given query.
        **/
        query(input: Query<Comment>, userToken: string): Promise<Array<Comment>>
        
        /**
        * Gets parts of Comments that match the given query.
        **/
        queryPartial(input: QueryPartial<Comment>, userToken: string): Promise<Array<DeepPartial<Comment>>>
        
        /**
        * Gets a single Comment by ID.
        **/
        detail(id: UUID, userToken: string): Promise<Comment>
        
        /**
        * Creates multiple Comments at the same time.
        **/
        insertBulk(input: Array<Comment>, userToken: string): Promise<Array<Comment>>
        
        /**
        * Creates a new Comment
        **/
        insert(input: Comment, userToken: string): Promise<Comment>
        
        /**
        * Creates or updates a Comment
        **/
        upsert(id: UUID, input: Comment, userToken: string): Promise<Comment>
        
        /**
        * Modifies many Comments at the same time by ID.
        **/
        bulkReplace(input: Array<Comment>, userToken: string): Promise<Array<Comment>>
        
        /**
        * Replaces a single Comment by ID.
        **/
        replace(id: UUID, input: Comment, userToken: string): Promise<Comment>
        
        /**
        * Modifies many Comments at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<Comment>, userToken: string): Promise<number>
        
        /**
        * Modifies a Comment by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<Comment>, userToken: string): Promise<EntryChange<Comment>>
        
        /**
        * Modifies a Comment by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<Comment>, userToken: string): Promise<Comment>
        
        /**
        * Deletes all matching Comments, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<Comment>, userToken: string): Promise<number>
        
        /**
        * Deletes a Comment by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Comments matching the given condition.
        **/
        count(input: Condition<Comment>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Comments matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<Comment>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Comments matching the given condition.
        **/
        aggregate(input: AggregateQuery<Comment>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Comments matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<Comment>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly organization: {
        
        /**
        * Gets a default Organization that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<Organization>
        
        /**
        * Gets a list of Organizations that match the given query.
        **/
        query(input: Query<Organization>, userToken: string): Promise<Array<Organization>>
        
        /**
        * Gets parts of Organizations that match the given query.
        **/
        queryPartial(input: QueryPartial<Organization>, userToken: string): Promise<Array<DeepPartial<Organization>>>
        
        /**
        * Gets a single Organization by ID.
        **/
        detail(id: UUID, userToken: string): Promise<Organization>
        
        /**
        * Creates multiple Organizations at the same time.
        **/
        insertBulk(input: Array<Organization>, userToken: string): Promise<Array<Organization>>
        
        /**
        * Creates a new Organization
        **/
        insert(input: Organization, userToken: string): Promise<Organization>
        
        /**
        * Creates or updates a Organization
        **/
        upsert(id: UUID, input: Organization, userToken: string): Promise<Organization>
        
        /**
        * Modifies many Organizations at the same time by ID.
        **/
        bulkReplace(input: Array<Organization>, userToken: string): Promise<Array<Organization>>
        
        /**
        * Replaces a single Organization by ID.
        **/
        replace(id: UUID, input: Organization, userToken: string): Promise<Organization>
        
        /**
        * Modifies many Organizations at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<Organization>, userToken: string): Promise<number>
        
        /**
        * Modifies a Organization by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<Organization>, userToken: string): Promise<EntryChange<Organization>>
        
        /**
        * Modifies a Organization by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<Organization>, userToken: string): Promise<Organization>
        
        /**
        * Deletes all matching Organizations, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<Organization>, userToken: string): Promise<number>
        
        /**
        * Deletes a Organization by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Organizations matching the given condition.
        **/
        count(input: Condition<Organization>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Organizations matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<Organization>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Organizations matching the given condition.
        **/
        aggregate(input: AggregateQuery<Organization>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Organizations matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<Organization>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly project: {
        
        /**
        * Gets a default Project that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<Project>
        
        /**
        * Gets a list of Projects that match the given query.
        **/
        query(input: Query<Project>, userToken: string): Promise<Array<Project>>
        
        /**
        * Gets parts of Projects that match the given query.
        **/
        queryPartial(input: QueryPartial<Project>, userToken: string): Promise<Array<DeepPartial<Project>>>
        
        /**
        * Gets a single Project by ID.
        **/
        detail(id: UUID, userToken: string): Promise<Project>
        
        /**
        * Creates multiple Projects at the same time.
        **/
        insertBulk(input: Array<Project>, userToken: string): Promise<Array<Project>>
        
        /**
        * Creates a new Project
        **/
        insert(input: Project, userToken: string): Promise<Project>
        
        /**
        * Creates or updates a Project
        **/
        upsert(id: UUID, input: Project, userToken: string): Promise<Project>
        
        /**
        * Modifies many Projects at the same time by ID.
        **/
        bulkReplace(input: Array<Project>, userToken: string): Promise<Array<Project>>
        
        /**
        * Replaces a single Project by ID.
        **/
        replace(id: UUID, input: Project, userToken: string): Promise<Project>
        
        /**
        * Modifies many Projects at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<Project>, userToken: string): Promise<number>
        
        /**
        * Modifies a Project by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<Project>, userToken: string): Promise<EntryChange<Project>>
        
        /**
        * Modifies a Project by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<Project>, userToken: string): Promise<Project>
        
        /**
        * Deletes all matching Projects, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<Project>, userToken: string): Promise<number>
        
        /**
        * Deletes a Project by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Projects matching the given condition.
        **/
        count(input: Condition<Project>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Projects matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<Project>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Projects matching the given condition.
        **/
        aggregate(input: AggregateQuery<Project>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Projects matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<Project>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly task: {
        
        /**
        * Gets a default Task that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<Task>
        
        /**
        * Gets a list of Tasks that match the given query.
        **/
        query(input: Query<Task>, userToken: string): Promise<Array<Task>>
        
        /**
        * Gets parts of Tasks that match the given query.
        **/
        queryPartial(input: QueryPartial<Task>, userToken: string): Promise<Array<DeepPartial<Task>>>
        
        /**
        * Gets a single Task by ID.
        **/
        detail(id: UUID, userToken: string): Promise<Task>
        
        /**
        * Creates multiple Tasks at the same time.
        **/
        insertBulk(input: Array<Task>, userToken: string): Promise<Array<Task>>
        
        /**
        * Creates a new Task
        **/
        insert(input: Task, userToken: string): Promise<Task>
        
        /**
        * Creates or updates a Task
        **/
        upsert(id: UUID, input: Task, userToken: string): Promise<Task>
        
        /**
        * Modifies many Tasks at the same time by ID.
        **/
        bulkReplace(input: Array<Task>, userToken: string): Promise<Array<Task>>
        
        /**
        * Replaces a single Task by ID.
        **/
        replace(id: UUID, input: Task, userToken: string): Promise<Task>
        
        /**
        * Modifies many Tasks at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<Task>, userToken: string): Promise<number>
        
        /**
        * Modifies a Task by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<Task>, userToken: string): Promise<EntryChange<Task>>
        
        /**
        * Modifies a Task by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<Task>, userToken: string): Promise<Task>
        
        /**
        * Deletes all matching Tasks, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<Task>, userToken: string): Promise<number>
        
        /**
        * Deletes a Task by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Tasks matching the given condition.
        **/
        count(input: Condition<Task>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Tasks matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<Task>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Tasks matching the given condition.
        **/
        aggregate(input: AggregateQuery<Task>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Tasks matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<Task>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly timeEntry: {
        
        /**
        * Gets a default TimeEntry that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<TimeEntry>
        
        /**
        * Gets a list of TimeEntrys that match the given query.
        **/
        query(input: Query<TimeEntry>, userToken: string): Promise<Array<TimeEntry>>
        
        /**
        * Gets parts of TimeEntrys that match the given query.
        **/
        queryPartial(input: QueryPartial<TimeEntry>, userToken: string): Promise<Array<DeepPartial<TimeEntry>>>
        
        /**
        * Gets a single TimeEntry by ID.
        **/
        detail(id: UUID, userToken: string): Promise<TimeEntry>
        
        /**
        * Creates multiple TimeEntrys at the same time.
        **/
        insertBulk(input: Array<TimeEntry>, userToken: string): Promise<Array<TimeEntry>>
        
        /**
        * Creates a new TimeEntry
        **/
        insert(input: TimeEntry, userToken: string): Promise<TimeEntry>
        
        /**
        * Creates or updates a TimeEntry
        **/
        upsert(id: UUID, input: TimeEntry, userToken: string): Promise<TimeEntry>
        
        /**
        * Modifies many TimeEntrys at the same time by ID.
        **/
        bulkReplace(input: Array<TimeEntry>, userToken: string): Promise<Array<TimeEntry>>
        
        /**
        * Replaces a single TimeEntry by ID.
        **/
        replace(id: UUID, input: TimeEntry, userToken: string): Promise<TimeEntry>
        
        /**
        * Modifies many TimeEntrys at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<TimeEntry>, userToken: string): Promise<number>
        
        /**
        * Modifies a TimeEntry by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<TimeEntry>, userToken: string): Promise<EntryChange<TimeEntry>>
        
        /**
        * Modifies a TimeEntry by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<TimeEntry>, userToken: string): Promise<TimeEntry>
        
        /**
        * Deletes all matching TimeEntrys, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<TimeEntry>, userToken: string): Promise<number>
        
        /**
        * Deletes a TimeEntry by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of TimeEntrys matching the given condition.
        **/
        count(input: Condition<TimeEntry>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of TimeEntrys matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<TimeEntry>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition.
        **/
        aggregate(input: AggregateQuery<TimeEntry>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<TimeEntry>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly timer: {
        
        /**
        * Gets a default Timer that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<Timer>
        
        /**
        * Gets a list of Timers that match the given query.
        **/
        query(input: Query<Timer>, userToken: string): Promise<Array<Timer>>
        
        /**
        * Gets parts of Timers that match the given query.
        **/
        queryPartial(input: QueryPartial<Timer>, userToken: string): Promise<Array<DeepPartial<Timer>>>
        
        /**
        * Gets a single Timer by ID.
        **/
        detail(id: UUID, userToken: string): Promise<Timer>
        
        /**
        * Creates multiple Timers at the same time.
        **/
        insertBulk(input: Array<Timer>, userToken: string): Promise<Array<Timer>>
        
        /**
        * Creates a new Timer
        **/
        insert(input: Timer, userToken: string): Promise<Timer>
        
        /**
        * Creates or updates a Timer
        **/
        upsert(id: UUID, input: Timer, userToken: string): Promise<Timer>
        
        /**
        * Modifies many Timers at the same time by ID.
        **/
        bulkReplace(input: Array<Timer>, userToken: string): Promise<Array<Timer>>
        
        /**
        * Replaces a single Timer by ID.
        **/
        replace(id: UUID, input: Timer, userToken: string): Promise<Timer>
        
        /**
        * Modifies many Timers at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<Timer>, userToken: string): Promise<number>
        
        /**
        * Modifies a Timer by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<Timer>, userToken: string): Promise<EntryChange<Timer>>
        
        /**
        * Modifies a Timer by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<Timer>, userToken: string): Promise<Timer>
        
        /**
        * Deletes all matching Timers, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<Timer>, userToken: string): Promise<number>
        
        /**
        * Deletes a Timer by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Timers matching the given condition.
        **/
        count(input: Condition<Timer>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Timers matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<Timer>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Timers matching the given condition.
        **/
        aggregate(input: AggregateQuery<Timer>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Timers matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<Timer>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
    readonly user: {
        
        /**
        * Gets a default User that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default(userToken: string): Promise<User>
        
        /**
        * Gets a list of Users that match the given query.
        **/
        query(input: Query<User>, userToken: string): Promise<Array<User>>
        
        /**
        * Gets parts of Users that match the given query.
        **/
        queryPartial(input: QueryPartial<User>, userToken: string): Promise<Array<DeepPartial<User>>>
        
        /**
        * Gets a single User by ID.
        **/
        detail(id: UUID, userToken: string): Promise<User>
        
        /**
        * Creates multiple Users at the same time.
        **/
        insertBulk(input: Array<User>, userToken: string): Promise<Array<User>>
        
        /**
        * Creates a new User
        **/
        insert(input: User, userToken: string): Promise<User>
        
        /**
        * Creates or updates a User
        **/
        upsert(id: UUID, input: User, userToken: string): Promise<User>
        
        /**
        * Modifies many Users at the same time by ID.
        **/
        bulkReplace(input: Array<User>, userToken: string): Promise<Array<User>>
        
        /**
        * Replaces a single User by ID.
        **/
        replace(id: UUID, input: User, userToken: string): Promise<User>
        
        /**
        * Modifies many Users at the same time.  Returns the number of changed items.
        **/
        bulkModify(input: MassModification<User>, userToken: string): Promise<number>
        
        /**
        * Modifies a User by ID, returning both the previous value and new value.
        **/
        modifyWithDiff(id: UUID, input: Modification<User>, userToken: string): Promise<EntryChange<User>>
        
        /**
        * Modifies a User by ID, returning the new value.
        **/
        modify(id: UUID, input: Modification<User>, userToken: string): Promise<User>
        
        /**
        * Deletes all matching Users, returning the number of deleted items.
        **/
        bulkDelete(input: Condition<User>, userToken: string): Promise<number>
        
        /**
        * Deletes a User by id.
        **/
        delete(id: UUID, userToken: string): Promise<void>
        
        /**
        * Gets the total number of Users matching the given condition.
        **/
        count(input: Condition<User>, userToken: string): Promise<number>
        
        /**
        * Gets the total number of Users matching the given condition divided by group.
        **/
        groupCount(input: GroupCountQuery<User>, userToken: string): Promise<Record<string, number>>
        
        /**
        * Aggregates a property of Users matching the given condition.
        **/
        aggregate(input: AggregateQuery<User>, userToken: string): Promise<number | null | undefined>
        
        /**
        * Aggregates a property of Users matching the given condition divided by group.
        **/
        groupAggregate(input: GroupAggregateQuery<User>, userToken: string): Promise<Record<string, number | null | undefined>>
    }
}



export class UserSession {
    constructor(public api: Api, public userToken: string) {}
    
    /**
    * Gets the current status of the server
    **/
    getServerHealth(): Promise<ServerHealth> { return this.api.getServerHealth(this.userToken) } 
    
    /**
    * Upload a file to make a request later.  Times out in around 10 minutes.
    **/
    uploadFileForRequest(): Promise<UploadInformation> { return this.api.uploadFileForRequest() } 
    readonly auth = {
        
        /**
        * Creates a new token for the user, which can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]'.
        **/
        refreshToken: (): Promise<string> => { return this.api.auth.refreshToken(this.userToken) }, 
        
        /**
        * Retrieves the user that you currently authenticated as.
        **/
        getSelf: (): Promise<User> => { return this.api.auth.getSelf(this.userToken) }, 
        
        /**
        * Creates a token for a new, anonymous user.  The token can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]
        **/
        anonymousToken: (): Promise<string> => { return this.api.auth.anonymousToken(this.userToken) }, 
        
        /**
        * Sends a login email to the given address.  The email will contain both a link to instantly log in and a PIN that can be entered to log in.
        **/
        emailLoginLink: (input: string): Promise<void> => { return this.api.auth.emailLoginLink(input) }, 
        
        /**
        * Logs in to the given account with a PIN that was provided in an email sent earlier.  Note that the PIN expires in 15 minutes, and you are only permitted 5 attempts.
        **/
        emailPINLogin: (input: EmailPinLogin): Promise<string> => { return this.api.auth.emailPINLogin(input) }, 
    }
    readonly comment = {
        
        /**
        * Gets a default Comment that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<Comment> => { return this.api.comment.default(this.userToken) }, 
        
        /**
        * Gets a list of Comments that match the given query.
        **/
        query: (input: Query<Comment>): Promise<Array<Comment>> => { return this.api.comment.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Comments that match the given query.
        **/
        queryPartial: (input: QueryPartial<Comment>): Promise<Array<DeepPartial<Comment>>> => { return this.api.comment.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single Comment by ID.
        **/
        detail: (id: UUID): Promise<Comment> => { return this.api.comment.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Comments at the same time.
        **/
        insertBulk: (input: Array<Comment>): Promise<Array<Comment>> => { return this.api.comment.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new Comment
        **/
        insert: (input: Comment): Promise<Comment> => { return this.api.comment.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a Comment
        **/
        upsert: (id: UUID, input: Comment): Promise<Comment> => { return this.api.comment.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Comments at the same time by ID.
        **/
        bulkReplace: (input: Array<Comment>): Promise<Array<Comment>> => { return this.api.comment.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single Comment by ID.
        **/
        replace: (id: UUID, input: Comment): Promise<Comment> => { return this.api.comment.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Comments at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Comment>): Promise<number> => { return this.api.comment.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a Comment by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Comment>): Promise<EntryChange<Comment>> => { return this.api.comment.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a Comment by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Comment>): Promise<Comment> => { return this.api.comment.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Comments, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Comment>): Promise<number> => { return this.api.comment.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a Comment by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.comment.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Comments matching the given condition.
        **/
        count: (input: Condition<Comment>): Promise<number> => { return this.api.comment.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Comments matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Comment>): Promise<Record<string, number>> => { return this.api.comment.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Comments matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Comment>): Promise<number | null | undefined> => { return this.api.comment.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Comments matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Comment>): Promise<Record<string, number | null | undefined>> => { return this.api.comment.groupAggregate(input, this.userToken) }, 
    }
    readonly organization = {
        
        /**
        * Gets a default Organization that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<Organization> => { return this.api.organization.default(this.userToken) }, 
        
        /**
        * Gets a list of Organizations that match the given query.
        **/
        query: (input: Query<Organization>): Promise<Array<Organization>> => { return this.api.organization.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Organizations that match the given query.
        **/
        queryPartial: (input: QueryPartial<Organization>): Promise<Array<DeepPartial<Organization>>> => { return this.api.organization.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single Organization by ID.
        **/
        detail: (id: UUID): Promise<Organization> => { return this.api.organization.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Organizations at the same time.
        **/
        insertBulk: (input: Array<Organization>): Promise<Array<Organization>> => { return this.api.organization.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new Organization
        **/
        insert: (input: Organization): Promise<Organization> => { return this.api.organization.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a Organization
        **/
        upsert: (id: UUID, input: Organization): Promise<Organization> => { return this.api.organization.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Organizations at the same time by ID.
        **/
        bulkReplace: (input: Array<Organization>): Promise<Array<Organization>> => { return this.api.organization.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single Organization by ID.
        **/
        replace: (id: UUID, input: Organization): Promise<Organization> => { return this.api.organization.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Organizations at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Organization>): Promise<number> => { return this.api.organization.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a Organization by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Organization>): Promise<EntryChange<Organization>> => { return this.api.organization.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a Organization by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Organization>): Promise<Organization> => { return this.api.organization.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Organizations, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Organization>): Promise<number> => { return this.api.organization.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a Organization by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.organization.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Organizations matching the given condition.
        **/
        count: (input: Condition<Organization>): Promise<number> => { return this.api.organization.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Organizations matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Organization>): Promise<Record<string, number>> => { return this.api.organization.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Organizations matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Organization>): Promise<number | null | undefined> => { return this.api.organization.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Organizations matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Organization>): Promise<Record<string, number | null | undefined>> => { return this.api.organization.groupAggregate(input, this.userToken) }, 
    }
    readonly project = {
        
        /**
        * Gets a default Project that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<Project> => { return this.api.project.default(this.userToken) }, 
        
        /**
        * Gets a list of Projects that match the given query.
        **/
        query: (input: Query<Project>): Promise<Array<Project>> => { return this.api.project.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Projects that match the given query.
        **/
        queryPartial: (input: QueryPartial<Project>): Promise<Array<DeepPartial<Project>>> => { return this.api.project.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single Project by ID.
        **/
        detail: (id: UUID): Promise<Project> => { return this.api.project.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Projects at the same time.
        **/
        insertBulk: (input: Array<Project>): Promise<Array<Project>> => { return this.api.project.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new Project
        **/
        insert: (input: Project): Promise<Project> => { return this.api.project.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a Project
        **/
        upsert: (id: UUID, input: Project): Promise<Project> => { return this.api.project.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Projects at the same time by ID.
        **/
        bulkReplace: (input: Array<Project>): Promise<Array<Project>> => { return this.api.project.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single Project by ID.
        **/
        replace: (id: UUID, input: Project): Promise<Project> => { return this.api.project.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Projects at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Project>): Promise<number> => { return this.api.project.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a Project by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Project>): Promise<EntryChange<Project>> => { return this.api.project.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a Project by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Project>): Promise<Project> => { return this.api.project.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Projects, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Project>): Promise<number> => { return this.api.project.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a Project by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.project.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Projects matching the given condition.
        **/
        count: (input: Condition<Project>): Promise<number> => { return this.api.project.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Projects matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Project>): Promise<Record<string, number>> => { return this.api.project.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Projects matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Project>): Promise<number | null | undefined> => { return this.api.project.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Projects matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Project>): Promise<Record<string, number | null | undefined>> => { return this.api.project.groupAggregate(input, this.userToken) }, 
    }
    readonly task = {
        
        /**
        * Gets a default Task that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<Task> => { return this.api.task.default(this.userToken) }, 
        
        /**
        * Gets a list of Tasks that match the given query.
        **/
        query: (input: Query<Task>): Promise<Array<Task>> => { return this.api.task.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Tasks that match the given query.
        **/
        queryPartial: (input: QueryPartial<Task>): Promise<Array<DeepPartial<Task>>> => { return this.api.task.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single Task by ID.
        **/
        detail: (id: UUID): Promise<Task> => { return this.api.task.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Tasks at the same time.
        **/
        insertBulk: (input: Array<Task>): Promise<Array<Task>> => { return this.api.task.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new Task
        **/
        insert: (input: Task): Promise<Task> => { return this.api.task.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a Task
        **/
        upsert: (id: UUID, input: Task): Promise<Task> => { return this.api.task.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Tasks at the same time by ID.
        **/
        bulkReplace: (input: Array<Task>): Promise<Array<Task>> => { return this.api.task.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single Task by ID.
        **/
        replace: (id: UUID, input: Task): Promise<Task> => { return this.api.task.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Tasks at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Task>): Promise<number> => { return this.api.task.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a Task by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Task>): Promise<EntryChange<Task>> => { return this.api.task.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a Task by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Task>): Promise<Task> => { return this.api.task.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Tasks, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Task>): Promise<number> => { return this.api.task.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a Task by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.task.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Tasks matching the given condition.
        **/
        count: (input: Condition<Task>): Promise<number> => { return this.api.task.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Tasks matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Task>): Promise<Record<string, number>> => { return this.api.task.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Tasks matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Task>): Promise<number | null | undefined> => { return this.api.task.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Tasks matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Task>): Promise<Record<string, number | null | undefined>> => { return this.api.task.groupAggregate(input, this.userToken) }, 
    }
    readonly timeEntry = {
        
        /**
        * Gets a default TimeEntry that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<TimeEntry> => { return this.api.timeEntry.default(this.userToken) }, 
        
        /**
        * Gets a list of TimeEntrys that match the given query.
        **/
        query: (input: Query<TimeEntry>): Promise<Array<TimeEntry>> => { return this.api.timeEntry.query(input, this.userToken) }, 
        
        /**
        * Gets parts of TimeEntrys that match the given query.
        **/
        queryPartial: (input: QueryPartial<TimeEntry>): Promise<Array<DeepPartial<TimeEntry>>> => { return this.api.timeEntry.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single TimeEntry by ID.
        **/
        detail: (id: UUID): Promise<TimeEntry> => { return this.api.timeEntry.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple TimeEntrys at the same time.
        **/
        insertBulk: (input: Array<TimeEntry>): Promise<Array<TimeEntry>> => { return this.api.timeEntry.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new TimeEntry
        **/
        insert: (input: TimeEntry): Promise<TimeEntry> => { return this.api.timeEntry.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a TimeEntry
        **/
        upsert: (id: UUID, input: TimeEntry): Promise<TimeEntry> => { return this.api.timeEntry.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many TimeEntrys at the same time by ID.
        **/
        bulkReplace: (input: Array<TimeEntry>): Promise<Array<TimeEntry>> => { return this.api.timeEntry.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single TimeEntry by ID.
        **/
        replace: (id: UUID, input: TimeEntry): Promise<TimeEntry> => { return this.api.timeEntry.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many TimeEntrys at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<TimeEntry>): Promise<number> => { return this.api.timeEntry.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a TimeEntry by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<TimeEntry>): Promise<EntryChange<TimeEntry>> => { return this.api.timeEntry.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a TimeEntry by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<TimeEntry>): Promise<TimeEntry> => { return this.api.timeEntry.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching TimeEntrys, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<TimeEntry>): Promise<number> => { return this.api.timeEntry.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a TimeEntry by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.timeEntry.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of TimeEntrys matching the given condition.
        **/
        count: (input: Condition<TimeEntry>): Promise<number> => { return this.api.timeEntry.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of TimeEntrys matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<TimeEntry>): Promise<Record<string, number>> => { return this.api.timeEntry.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition.
        **/
        aggregate: (input: AggregateQuery<TimeEntry>): Promise<number | null | undefined> => { return this.api.timeEntry.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<TimeEntry>): Promise<Record<string, number | null | undefined>> => { return this.api.timeEntry.groupAggregate(input, this.userToken) }, 
    }
    readonly timer = {
        
        /**
        * Gets a default Timer that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<Timer> => { return this.api.timer.default(this.userToken) }, 
        
        /**
        * Gets a list of Timers that match the given query.
        **/
        query: (input: Query<Timer>): Promise<Array<Timer>> => { return this.api.timer.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Timers that match the given query.
        **/
        queryPartial: (input: QueryPartial<Timer>): Promise<Array<DeepPartial<Timer>>> => { return this.api.timer.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single Timer by ID.
        **/
        detail: (id: UUID): Promise<Timer> => { return this.api.timer.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Timers at the same time.
        **/
        insertBulk: (input: Array<Timer>): Promise<Array<Timer>> => { return this.api.timer.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new Timer
        **/
        insert: (input: Timer): Promise<Timer> => { return this.api.timer.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a Timer
        **/
        upsert: (id: UUID, input: Timer): Promise<Timer> => { return this.api.timer.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Timers at the same time by ID.
        **/
        bulkReplace: (input: Array<Timer>): Promise<Array<Timer>> => { return this.api.timer.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single Timer by ID.
        **/
        replace: (id: UUID, input: Timer): Promise<Timer> => { return this.api.timer.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Timers at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Timer>): Promise<number> => { return this.api.timer.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a Timer by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Timer>): Promise<EntryChange<Timer>> => { return this.api.timer.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a Timer by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Timer>): Promise<Timer> => { return this.api.timer.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Timers, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Timer>): Promise<number> => { return this.api.timer.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a Timer by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.timer.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Timers matching the given condition.
        **/
        count: (input: Condition<Timer>): Promise<number> => { return this.api.timer.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Timers matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Timer>): Promise<Record<string, number>> => { return this.api.timer.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Timers matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Timer>): Promise<number | null | undefined> => { return this.api.timer.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Timers matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Timer>): Promise<Record<string, number | null | undefined>> => { return this.api.timer.groupAggregate(input, this.userToken) }, 
    }
    readonly user = {
        
        /**
        * Gets a default User that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (): Promise<User> => { return this.api.user.default(this.userToken) }, 
        
        /**
        * Gets a list of Users that match the given query.
        **/
        query: (input: Query<User>): Promise<Array<User>> => { return this.api.user.query(input, this.userToken) }, 
        
        /**
        * Gets parts of Users that match the given query.
        **/
        queryPartial: (input: QueryPartial<User>): Promise<Array<DeepPartial<User>>> => { return this.api.user.queryPartial(input, this.userToken) }, 
        
        /**
        * Gets a single User by ID.
        **/
        detail: (id: UUID): Promise<User> => { return this.api.user.detail(id, this.userToken) }, 
        
        /**
        * Creates multiple Users at the same time.
        **/
        insertBulk: (input: Array<User>): Promise<Array<User>> => { return this.api.user.insertBulk(input, this.userToken) }, 
        
        /**
        * Creates a new User
        **/
        insert: (input: User): Promise<User> => { return this.api.user.insert(input, this.userToken) }, 
        
        /**
        * Creates or updates a User
        **/
        upsert: (id: UUID, input: User): Promise<User> => { return this.api.user.upsert(id, input, this.userToken) }, 
        
        /**
        * Modifies many Users at the same time by ID.
        **/
        bulkReplace: (input: Array<User>): Promise<Array<User>> => { return this.api.user.bulkReplace(input, this.userToken) }, 
        
        /**
        * Replaces a single User by ID.
        **/
        replace: (id: UUID, input: User): Promise<User> => { return this.api.user.replace(id, input, this.userToken) }, 
        
        /**
        * Modifies many Users at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<User>): Promise<number> => { return this.api.user.bulkModify(input, this.userToken) }, 
        
        /**
        * Modifies a User by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<User>): Promise<EntryChange<User>> => { return this.api.user.modifyWithDiff(id, input, this.userToken) }, 
        
        /**
        * Modifies a User by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<User>): Promise<User> => { return this.api.user.modify(id, input, this.userToken) }, 
        
        /**
        * Deletes all matching Users, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<User>): Promise<number> => { return this.api.user.bulkDelete(input, this.userToken) }, 
        
        /**
        * Deletes a User by id.
        **/
        delete: (id: UUID): Promise<void> => { return this.api.user.delete(id, this.userToken) }, 
        
        /**
        * Gets the total number of Users matching the given condition.
        **/
        count: (input: Condition<User>): Promise<number> => { return this.api.user.count(input, this.userToken) }, 
        
        /**
        * Gets the total number of Users matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<User>): Promise<Record<string, number>> => { return this.api.user.groupCount(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Users matching the given condition.
        **/
        aggregate: (input: AggregateQuery<User>): Promise<number | null | undefined> => { return this.api.user.aggregate(input, this.userToken) }, 
        
        /**
        * Aggregates a property of Users matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<User>): Promise<Record<string, number | null | undefined>> => { return this.api.user.groupAggregate(input, this.userToken) }, 
    }
}




export class LiveApi implements Api {
    public constructor(public httpUrl: string, public socketUrl: string = httpUrl, public extraHeaders: Record<string, string> = {}, public responseInterceptors?: (x: Response)=>Response) {}
    
    /**
    * Gets the current status of the server
    **/
    getServerHealth(userToken?: string): Promise<ServerHealth> {
        return apiCall<void>(
            `${this.httpUrl}/meta/health`,
            undefined,
            {
                method: "GET",
                headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
            }, 
            undefined,
            this.responseInterceptors, 
        ).then(x => x.json())
    }
    
    /**
    * Upload a file to make a request later.  Times out in around 10 minutes.
    **/
    uploadFileForRequest(): Promise<UploadInformation> {
        return apiCall<void>(
            `${this.httpUrl}/upload-early`,
            undefined,
            {
                method: "GET",
            }, 
            undefined,
            this.responseInterceptors, 
        ).then(x => x.json())
    }
    readonly auth = {
        
        /**
        * Creates a new token for the user, which can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]'.
        **/
        refreshToken: (userToken: string): Promise<string> => {
            return apiCall<void>(
                `${this.httpUrl}/auth/refresh-token`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Retrieves the user that you currently authenticated as.
        **/
        getSelf: (userToken: string): Promise<User> => {
            return apiCall<void>(
                `${this.httpUrl}/auth/self`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a token for a new, anonymous user.  The token can be used to authenticate with the API via the header 'Authorization: Bearer [insert token here]
        **/
        anonymousToken: (userToken?: string): Promise<string> => {
            return apiCall<void>(
                `${this.httpUrl}/auth/anonymous`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Sends a login email to the given address.  The email will contain both a link to instantly log in and a PIN that can be entered to log in.
        **/
        emailLoginLink: (input: string): Promise<void> => {
            return apiCall<string>(
                `${this.httpUrl}/auth/login-email`,
                input,
                {
                    method: "POST",
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Logs in to the given account with a PIN that was provided in an email sent earlier.  Note that the PIN expires in 15 minutes, and you are only permitted 5 attempts.
        **/
        emailPINLogin: (input: EmailPinLogin): Promise<string> => {
            return apiCall<EmailPinLogin>(
                `${this.httpUrl}/auth/login-email-pin`,
                input,
                {
                    method: "POST",
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly comment = {
        
        /**
        * Gets a default Comment that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<Comment> => {
            return apiCall<void>(
                `${this.httpUrl}/comments/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Comments that match the given query.
        **/
        query: (input: Query<Comment>, userToken: string): Promise<Array<Comment>> => {
            return apiCall<Query<Comment>>(
                `${this.httpUrl}/comments/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Comments that match the given query.
        **/
        queryPartial: (input: QueryPartial<Comment>, userToken: string): Promise<Array<DeepPartial<Comment>>> => {
            return apiCall<QueryPartial<Comment>>(
                `${this.httpUrl}/comments/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single Comment by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<Comment> => {
            return apiCall<void>(
                `${this.httpUrl}/comments/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Comments at the same time.
        **/
        insertBulk: (input: Array<Comment>, userToken: string): Promise<Array<Comment>> => {
            return apiCall<Array<Comment>>(
                `${this.httpUrl}/comments/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new Comment
        **/
        insert: (input: Comment, userToken: string): Promise<Comment> => {
            return apiCall<Comment>(
                `${this.httpUrl}/comments/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a Comment
        **/
        upsert: (id: UUID, input: Comment, userToken: string): Promise<Comment> => {
            return apiCall<Comment>(
                `${this.httpUrl}/comments/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Comments at the same time by ID.
        **/
        bulkReplace: (input: Array<Comment>, userToken: string): Promise<Array<Comment>> => {
            return apiCall<Array<Comment>>(
                `${this.httpUrl}/comments/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single Comment by ID.
        **/
        replace: (id: UUID, input: Comment, userToken: string): Promise<Comment> => {
            return apiCall<Comment>(
                `${this.httpUrl}/comments/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Comments at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Comment>, userToken: string): Promise<number> => {
            return apiCall<MassModification<Comment>>(
                `${this.httpUrl}/comments/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Comment by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Comment>, userToken: string): Promise<EntryChange<Comment>> => {
            return apiCall<Modification<Comment>>(
                `${this.httpUrl}/comments/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Comment by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Comment>, userToken: string): Promise<Comment> => {
            return apiCall<Modification<Comment>>(
                `${this.httpUrl}/comments/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Comments, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Comment>, userToken: string): Promise<number> => {
            return apiCall<Condition<Comment>>(
                `${this.httpUrl}/comments/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a Comment by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/comments/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Comments matching the given condition.
        **/
        count: (input: Condition<Comment>, userToken: string): Promise<number> => {
            return apiCall<Condition<Comment>>(
                `${this.httpUrl}/comments/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Comments matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Comment>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<Comment>>(
                `${this.httpUrl}/comments/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Comments matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Comment>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<Comment>>(
                `${this.httpUrl}/comments/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Comments matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Comment>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<Comment>>(
                `${this.httpUrl}/comments/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly organization = {
        
        /**
        * Gets a default Organization that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<Organization> => {
            return apiCall<void>(
                `${this.httpUrl}/organizations/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Organizations that match the given query.
        **/
        query: (input: Query<Organization>, userToken: string): Promise<Array<Organization>> => {
            return apiCall<Query<Organization>>(
                `${this.httpUrl}/organizations/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Organizations that match the given query.
        **/
        queryPartial: (input: QueryPartial<Organization>, userToken: string): Promise<Array<DeepPartial<Organization>>> => {
            return apiCall<QueryPartial<Organization>>(
                `${this.httpUrl}/organizations/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single Organization by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<Organization> => {
            return apiCall<void>(
                `${this.httpUrl}/organizations/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Organizations at the same time.
        **/
        insertBulk: (input: Array<Organization>, userToken: string): Promise<Array<Organization>> => {
            return apiCall<Array<Organization>>(
                `${this.httpUrl}/organizations/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new Organization
        **/
        insert: (input: Organization, userToken: string): Promise<Organization> => {
            return apiCall<Organization>(
                `${this.httpUrl}/organizations/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a Organization
        **/
        upsert: (id: UUID, input: Organization, userToken: string): Promise<Organization> => {
            return apiCall<Organization>(
                `${this.httpUrl}/organizations/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Organizations at the same time by ID.
        **/
        bulkReplace: (input: Array<Organization>, userToken: string): Promise<Array<Organization>> => {
            return apiCall<Array<Organization>>(
                `${this.httpUrl}/organizations/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single Organization by ID.
        **/
        replace: (id: UUID, input: Organization, userToken: string): Promise<Organization> => {
            return apiCall<Organization>(
                `${this.httpUrl}/organizations/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Organizations at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Organization>, userToken: string): Promise<number> => {
            return apiCall<MassModification<Organization>>(
                `${this.httpUrl}/organizations/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Organization by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Organization>, userToken: string): Promise<EntryChange<Organization>> => {
            return apiCall<Modification<Organization>>(
                `${this.httpUrl}/organizations/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Organization by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Organization>, userToken: string): Promise<Organization> => {
            return apiCall<Modification<Organization>>(
                `${this.httpUrl}/organizations/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Organizations, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Organization>, userToken: string): Promise<number> => {
            return apiCall<Condition<Organization>>(
                `${this.httpUrl}/organizations/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a Organization by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/organizations/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Organizations matching the given condition.
        **/
        count: (input: Condition<Organization>, userToken: string): Promise<number> => {
            return apiCall<Condition<Organization>>(
                `${this.httpUrl}/organizations/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Organizations matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Organization>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<Organization>>(
                `${this.httpUrl}/organizations/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Organizations matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Organization>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<Organization>>(
                `${this.httpUrl}/organizations/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Organizations matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Organization>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<Organization>>(
                `${this.httpUrl}/organizations/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly project = {
        
        /**
        * Gets a default Project that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<Project> => {
            return apiCall<void>(
                `${this.httpUrl}/projects/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Projects that match the given query.
        **/
        query: (input: Query<Project>, userToken: string): Promise<Array<Project>> => {
            return apiCall<Query<Project>>(
                `${this.httpUrl}/projects/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Projects that match the given query.
        **/
        queryPartial: (input: QueryPartial<Project>, userToken: string): Promise<Array<DeepPartial<Project>>> => {
            return apiCall<QueryPartial<Project>>(
                `${this.httpUrl}/projects/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single Project by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<Project> => {
            return apiCall<void>(
                `${this.httpUrl}/projects/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Projects at the same time.
        **/
        insertBulk: (input: Array<Project>, userToken: string): Promise<Array<Project>> => {
            return apiCall<Array<Project>>(
                `${this.httpUrl}/projects/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new Project
        **/
        insert: (input: Project, userToken: string): Promise<Project> => {
            return apiCall<Project>(
                `${this.httpUrl}/projects/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a Project
        **/
        upsert: (id: UUID, input: Project, userToken: string): Promise<Project> => {
            return apiCall<Project>(
                `${this.httpUrl}/projects/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Projects at the same time by ID.
        **/
        bulkReplace: (input: Array<Project>, userToken: string): Promise<Array<Project>> => {
            return apiCall<Array<Project>>(
                `${this.httpUrl}/projects/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single Project by ID.
        **/
        replace: (id: UUID, input: Project, userToken: string): Promise<Project> => {
            return apiCall<Project>(
                `${this.httpUrl}/projects/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Projects at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Project>, userToken: string): Promise<number> => {
            return apiCall<MassModification<Project>>(
                `${this.httpUrl}/projects/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Project by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Project>, userToken: string): Promise<EntryChange<Project>> => {
            return apiCall<Modification<Project>>(
                `${this.httpUrl}/projects/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Project by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Project>, userToken: string): Promise<Project> => {
            return apiCall<Modification<Project>>(
                `${this.httpUrl}/projects/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Projects, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Project>, userToken: string): Promise<number> => {
            return apiCall<Condition<Project>>(
                `${this.httpUrl}/projects/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a Project by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/projects/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Projects matching the given condition.
        **/
        count: (input: Condition<Project>, userToken: string): Promise<number> => {
            return apiCall<Condition<Project>>(
                `${this.httpUrl}/projects/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Projects matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Project>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<Project>>(
                `${this.httpUrl}/projects/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Projects matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Project>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<Project>>(
                `${this.httpUrl}/projects/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Projects matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Project>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<Project>>(
                `${this.httpUrl}/projects/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly task = {
        
        /**
        * Gets a default Task that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<Task> => {
            return apiCall<void>(
                `${this.httpUrl}/tasks/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Tasks that match the given query.
        **/
        query: (input: Query<Task>, userToken: string): Promise<Array<Task>> => {
            return apiCall<Query<Task>>(
                `${this.httpUrl}/tasks/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Tasks that match the given query.
        **/
        queryPartial: (input: QueryPartial<Task>, userToken: string): Promise<Array<DeepPartial<Task>>> => {
            return apiCall<QueryPartial<Task>>(
                `${this.httpUrl}/tasks/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single Task by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<Task> => {
            return apiCall<void>(
                `${this.httpUrl}/tasks/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Tasks at the same time.
        **/
        insertBulk: (input: Array<Task>, userToken: string): Promise<Array<Task>> => {
            return apiCall<Array<Task>>(
                `${this.httpUrl}/tasks/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new Task
        **/
        insert: (input: Task, userToken: string): Promise<Task> => {
            return apiCall<Task>(
                `${this.httpUrl}/tasks/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a Task
        **/
        upsert: (id: UUID, input: Task, userToken: string): Promise<Task> => {
            return apiCall<Task>(
                `${this.httpUrl}/tasks/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Tasks at the same time by ID.
        **/
        bulkReplace: (input: Array<Task>, userToken: string): Promise<Array<Task>> => {
            return apiCall<Array<Task>>(
                `${this.httpUrl}/tasks/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single Task by ID.
        **/
        replace: (id: UUID, input: Task, userToken: string): Promise<Task> => {
            return apiCall<Task>(
                `${this.httpUrl}/tasks/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Tasks at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Task>, userToken: string): Promise<number> => {
            return apiCall<MassModification<Task>>(
                `${this.httpUrl}/tasks/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Task by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Task>, userToken: string): Promise<EntryChange<Task>> => {
            return apiCall<Modification<Task>>(
                `${this.httpUrl}/tasks/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Task by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Task>, userToken: string): Promise<Task> => {
            return apiCall<Modification<Task>>(
                `${this.httpUrl}/tasks/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Tasks, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Task>, userToken: string): Promise<number> => {
            return apiCall<Condition<Task>>(
                `${this.httpUrl}/tasks/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a Task by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/tasks/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Tasks matching the given condition.
        **/
        count: (input: Condition<Task>, userToken: string): Promise<number> => {
            return apiCall<Condition<Task>>(
                `${this.httpUrl}/tasks/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Tasks matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Task>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<Task>>(
                `${this.httpUrl}/tasks/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Tasks matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Task>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<Task>>(
                `${this.httpUrl}/tasks/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Tasks matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Task>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<Task>>(
                `${this.httpUrl}/tasks/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly timeEntry = {
        
        /**
        * Gets a default TimeEntry that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<TimeEntry> => {
            return apiCall<void>(
                `${this.httpUrl}/time-entries/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of TimeEntrys that match the given query.
        **/
        query: (input: Query<TimeEntry>, userToken: string): Promise<Array<TimeEntry>> => {
            return apiCall<Query<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of TimeEntrys that match the given query.
        **/
        queryPartial: (input: QueryPartial<TimeEntry>, userToken: string): Promise<Array<DeepPartial<TimeEntry>>> => {
            return apiCall<QueryPartial<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single TimeEntry by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<TimeEntry> => {
            return apiCall<void>(
                `${this.httpUrl}/time-entries/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple TimeEntrys at the same time.
        **/
        insertBulk: (input: Array<TimeEntry>, userToken: string): Promise<Array<TimeEntry>> => {
            return apiCall<Array<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new TimeEntry
        **/
        insert: (input: TimeEntry, userToken: string): Promise<TimeEntry> => {
            return apiCall<TimeEntry>(
                `${this.httpUrl}/time-entries/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a TimeEntry
        **/
        upsert: (id: UUID, input: TimeEntry, userToken: string): Promise<TimeEntry> => {
            return apiCall<TimeEntry>(
                `${this.httpUrl}/time-entries/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many TimeEntrys at the same time by ID.
        **/
        bulkReplace: (input: Array<TimeEntry>, userToken: string): Promise<Array<TimeEntry>> => {
            return apiCall<Array<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single TimeEntry by ID.
        **/
        replace: (id: UUID, input: TimeEntry, userToken: string): Promise<TimeEntry> => {
            return apiCall<TimeEntry>(
                `${this.httpUrl}/time-entries/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many TimeEntrys at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<TimeEntry>, userToken: string): Promise<number> => {
            return apiCall<MassModification<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a TimeEntry by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<TimeEntry>, userToken: string): Promise<EntryChange<TimeEntry>> => {
            return apiCall<Modification<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a TimeEntry by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<TimeEntry>, userToken: string): Promise<TimeEntry> => {
            return apiCall<Modification<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching TimeEntrys, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<TimeEntry>, userToken: string): Promise<number> => {
            return apiCall<Condition<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a TimeEntry by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/time-entries/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of TimeEntrys matching the given condition.
        **/
        count: (input: Condition<TimeEntry>, userToken: string): Promise<number> => {
            return apiCall<Condition<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of TimeEntrys matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<TimeEntry>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition.
        **/
        aggregate: (input: AggregateQuery<TimeEntry>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of TimeEntrys matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<TimeEntry>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<TimeEntry>>(
                `${this.httpUrl}/time-entries/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly timer = {
        
        /**
        * Gets a default Timer that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<Timer> => {
            return apiCall<void>(
                `${this.httpUrl}/timers/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Timers that match the given query.
        **/
        query: (input: Query<Timer>, userToken: string): Promise<Array<Timer>> => {
            return apiCall<Query<Timer>>(
                `${this.httpUrl}/timers/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Timers that match the given query.
        **/
        queryPartial: (input: QueryPartial<Timer>, userToken: string): Promise<Array<DeepPartial<Timer>>> => {
            return apiCall<QueryPartial<Timer>>(
                `${this.httpUrl}/timers/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single Timer by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<Timer> => {
            return apiCall<void>(
                `${this.httpUrl}/timers/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Timers at the same time.
        **/
        insertBulk: (input: Array<Timer>, userToken: string): Promise<Array<Timer>> => {
            return apiCall<Array<Timer>>(
                `${this.httpUrl}/timers/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new Timer
        **/
        insert: (input: Timer, userToken: string): Promise<Timer> => {
            return apiCall<Timer>(
                `${this.httpUrl}/timers/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a Timer
        **/
        upsert: (id: UUID, input: Timer, userToken: string): Promise<Timer> => {
            return apiCall<Timer>(
                `${this.httpUrl}/timers/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Timers at the same time by ID.
        **/
        bulkReplace: (input: Array<Timer>, userToken: string): Promise<Array<Timer>> => {
            return apiCall<Array<Timer>>(
                `${this.httpUrl}/timers/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single Timer by ID.
        **/
        replace: (id: UUID, input: Timer, userToken: string): Promise<Timer> => {
            return apiCall<Timer>(
                `${this.httpUrl}/timers/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Timers at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<Timer>, userToken: string): Promise<number> => {
            return apiCall<MassModification<Timer>>(
                `${this.httpUrl}/timers/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Timer by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<Timer>, userToken: string): Promise<EntryChange<Timer>> => {
            return apiCall<Modification<Timer>>(
                `${this.httpUrl}/timers/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a Timer by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<Timer>, userToken: string): Promise<Timer> => {
            return apiCall<Modification<Timer>>(
                `${this.httpUrl}/timers/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Timers, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<Timer>, userToken: string): Promise<number> => {
            return apiCall<Condition<Timer>>(
                `${this.httpUrl}/timers/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a Timer by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/timers/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Timers matching the given condition.
        **/
        count: (input: Condition<Timer>, userToken: string): Promise<number> => {
            return apiCall<Condition<Timer>>(
                `${this.httpUrl}/timers/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Timers matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<Timer>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<Timer>>(
                `${this.httpUrl}/timers/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Timers matching the given condition.
        **/
        aggregate: (input: AggregateQuery<Timer>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<Timer>>(
                `${this.httpUrl}/timers/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Timers matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<Timer>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<Timer>>(
                `${this.httpUrl}/timers/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
    readonly user = {
        
        /**
        * Gets a default User that would be useful to start creating a full one to insert.  Primarily used for administrative interfaces.
        **/
        default: (userToken: string): Promise<User> => {
            return apiCall<void>(
                `${this.httpUrl}/users/rest/_default_`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a list of Users that match the given query.
        **/
        query: (input: Query<User>, userToken: string): Promise<Array<User>> => {
            return apiCall<Query<User>>(
                `${this.httpUrl}/users/rest/query`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets parts of Users that match the given query.
        **/
        queryPartial: (input: QueryPartial<User>, userToken: string): Promise<Array<DeepPartial<User>>> => {
            return apiCall<QueryPartial<User>>(
                `${this.httpUrl}/users/rest/query-partial`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets a single User by ID.
        **/
        detail: (id: UUID, userToken: string): Promise<User> => {
            return apiCall<void>(
                `${this.httpUrl}/users/rest/${id}`,
                undefined,
                {
                    method: "GET",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates multiple Users at the same time.
        **/
        insertBulk: (input: Array<User>, userToken: string): Promise<Array<User>> => {
            return apiCall<Array<User>>(
                `${this.httpUrl}/users/rest/bulk`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates a new User
        **/
        insert: (input: User, userToken: string): Promise<User> => {
            return apiCall<User>(
                `${this.httpUrl}/users/rest`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Creates or updates a User
        **/
        upsert: (id: UUID, input: User, userToken: string): Promise<User> => {
            return apiCall<User>(
                `${this.httpUrl}/users/rest/${id}`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Users at the same time by ID.
        **/
        bulkReplace: (input: Array<User>, userToken: string): Promise<Array<User>> => {
            return apiCall<Array<User>>(
                `${this.httpUrl}/users/rest`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Replaces a single User by ID.
        **/
        replace: (id: UUID, input: User, userToken: string): Promise<User> => {
            return apiCall<User>(
                `${this.httpUrl}/users/rest/${id}`,
                input,
                {
                    method: "PUT",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies many Users at the same time.  Returns the number of changed items.
        **/
        bulkModify: (input: MassModification<User>, userToken: string): Promise<number> => {
            return apiCall<MassModification<User>>(
                `${this.httpUrl}/users/rest/bulk`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a User by ID, returning both the previous value and new value.
        **/
        modifyWithDiff: (id: UUID, input: Modification<User>, userToken: string): Promise<EntryChange<User>> => {
            return apiCall<Modification<User>>(
                `${this.httpUrl}/users/rest/${id}/delta`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Modifies a User by ID, returning the new value.
        **/
        modify: (id: UUID, input: Modification<User>, userToken: string): Promise<User> => {
            return apiCall<Modification<User>>(
                `${this.httpUrl}/users/rest/${id}`,
                input,
                {
                    method: "PATCH",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes all matching Users, returning the number of deleted items.
        **/
        bulkDelete: (input: Condition<User>, userToken: string): Promise<number> => {
            return apiCall<Condition<User>>(
                `${this.httpUrl}/users/rest/bulk-delete`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Deletes a User by id.
        **/
        delete: (id: UUID, userToken: string): Promise<void> => {
            return apiCall<void>(
                `${this.httpUrl}/users/rest/${id}`,
                undefined,
                {
                    method: "DELETE",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => undefined)
        },
        
        /**
        * Gets the total number of Users matching the given condition.
        **/
        count: (input: Condition<User>, userToken: string): Promise<number> => {
            return apiCall<Condition<User>>(
                `${this.httpUrl}/users/rest/count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Gets the total number of Users matching the given condition divided by group.
        **/
        groupCount: (input: GroupCountQuery<User>, userToken: string): Promise<Record<string, number>> => {
            return apiCall<GroupCountQuery<User>>(
                `${this.httpUrl}/users/rest/group-count`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Users matching the given condition.
        **/
        aggregate: (input: AggregateQuery<User>, userToken: string): Promise<number | null | undefined> => {
            return apiCall<AggregateQuery<User>>(
                `${this.httpUrl}/users/rest/aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
        
        /**
        * Aggregates a property of Users matching the given condition divided by group.
        **/
        groupAggregate: (input: GroupAggregateQuery<User>, userToken: string): Promise<Record<string, number | null | undefined>> => {
            return apiCall<GroupAggregateQuery<User>>(
                `${this.httpUrl}/users/rest/group-aggregate`,
                input,
                {
                    method: "POST",
                    headers: userToken ? { ...this.extraHeaders, "Authorization": `Bearer ${userToken}` } : this.extraHeaders,
                }, 
                undefined,
                this.responseInterceptors, 
            ).then(x => x.json())
        },
    }
}

