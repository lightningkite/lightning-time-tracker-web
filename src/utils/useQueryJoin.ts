import {
  annotateEndpoint,
  HasId,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {UserSession} from "api/sdk"

/** Interface for an object that has all the same keys as a SessionRestEndpoint */
type HasKeysOfSessionRestEndpoint<T extends HasId> = Record<
  keyof SessionRestEndpoint<T>,
  any
>

type SessionEndpointKey = keyof Pick<
  UserSession,
  {
    [K in keyof UserSession]: UserSession[K] extends HasKeysOfSessionRestEndpoint<any>
      ? K
      : never
  }[keyof UserSession]
>

/**
 * Example:
 *
 * TypeOfSessionEndpointKey<"organization">
 *
 * `> Organization`
 */
type TypeOfSessionEndpointKey<K extends SessionEndpointKey> = Awaited<
  ReturnType<UserSession[K]["detail"]>
>

const referentialSchema = {
  organization: {
    owner: "user"
  },
  project: {
    organization: "organization"
  },
  user: {
    organization: "organization"
  },
  task: {
    project: "project",
    organization: "organization",
    user: "user"
  },
  timeEntry: {
    task: "task",
    user: "user",
    project: "project",
    organization: "organization"
  },
  timer: {
    user: "user",
    task: "task",
    project: "project",
    organization: "organization"
  }
} satisfies {
  [P in SessionEndpointKey]: Partial<
    Record<keyof TypeOfSessionEndpointKey<P>, SessionEndpointKey>
  >
}

type ReferentialSchema = typeof referentialSchema

// TODO: annotations key should be _annotations

export function useQueryJoin<
  T extends HasId,
  BASE_ENDPOINT_KEY extends SessionEndpointKey,
  ANNOTATE_WITH_KEY extends keyof ReferentialSchema[BASE_ENDPOINT_KEY]
>(params: {
  baseEndpoint: BASE_ENDPOINT_KEY
  annotateWith: ANNOTATE_WITH_KEY[]
}): SessionRestEndpoint<
  WithAnnotations<
    T,
    Record<
      ANNOTATE_WITH_KEY,
      TypeOfSessionEndpointKey<
        // @ts-expect-error
        ReferentialSchema[BASE_ENDPOINT_KEY][ANNOTATE_WITH_KEY]
      >
    >
  >
> {
  const {baseEndpoint} = params

  const annotatedEndpoint = annotateEndpoint(baseEndpoint, async (items) =>
    items.map((i) => ({...i, annotations: {} as any}))
  )
  return annotatedEndpoint
}

// Record<
//     ANNOTATE_WITH_KEY,
//     TypeOfSessionEndpointKey<
//       ReferentialSchema[BASE_ENDPOINT_KEY][ANNOTATE_WITH_KEY]
//     >
//   >
