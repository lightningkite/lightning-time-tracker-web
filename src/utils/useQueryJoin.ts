import {
  annotateEndpoint,
  HasId,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {UserSession} from "api/sdk"
import {useContext} from "react"
import {AuthContext} from "./context"

/** Check that type has all keys of SessionRestEndpoint */
type IsSessionRestEndpoint<T extends HasId> = Record<
  keyof SessionRestEndpoint<T>,
  any
>

/** Picks all the keys of UserSession that are rest endpoints */
type EndpointKey = keyof Pick<
  UserSession,
  {
    [K in keyof UserSession]: UserSession[K] extends IsSessionRestEndpoint<any>
      ? K
      : never
  }[keyof UserSession]
>

/**
 * Gets the model type of a given key for a rest endpoint
 *
 * Example:
 * ```ts
 * TypeOfEndpointKey<"organization">
 * // Organization
 * ```
 */
type TypeOfEndpointKey<K extends EndpointKey> = Awaited<
  ReturnType<UserSession[K]["detail"]>
>

type TypeOfAnnotation<
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof ReferentialSchema[BASE_ENDPOINT_KEY]
> = {
  [A in ANNOTATE_WITH_KEYS]:
    | undefined
    | TypeOfEndpointKey<
        // @ts-expect-error
        ReferentialSchema[BASE_ENDPOINT_KEY][A]
      >
}

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
  [P in EndpointKey]: Partial<Record<keyof TypeOfEndpointKey<P>, EndpointKey>>
}

type ReferentialSchema = typeof referentialSchema

export type JoinedQueryType<
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof ReferentialSchema[BASE_ENDPOINT_KEY]
> = WithAnnotations<
  TypeOfEndpointKey<BASE_ENDPOINT_KEY>,
  TypeOfAnnotation<BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS>
>

export type UseQueryJoinReturn<
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof ReferentialSchema[BASE_ENDPOINT_KEY]
> = SessionRestEndpoint<JoinedQueryType<BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS>>

export function useQueryJoin<
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof ReferentialSchema[BASE_ENDPOINT_KEY]
>(params: {
  baseKey: BASE_ENDPOINT_KEY
  annotationKeys: ANNOTATE_WITH_KEYS[]
}): UseQueryJoinReturn<BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS> {
  const {baseKey, annotationKeys} = params
  const {session} = useContext(AuthContext)

  const baseEndpoint = session[baseKey]

  const annotatedEndpoint = annotateEndpoint(baseEndpoint, async (items) => {
    const annotationEndpointKeys = annotationKeys.map(
      (key) => referentialSchema[baseKey][key]
    ) as unknown as EndpointKey[]

    console.log(annotationEndpointKeys)

    const annotationRequests: Promise<HasId[]>[] = annotationEndpointKeys.map(
      (annotationKey) => {
        // @ts-expect-error
        const fkOnItem = referentialSchema[baseKey][annotationKey]

        const annotationEndpoint = session[
          annotationKey
        ] as SessionRestEndpoint<any>

        const annotationIds = new Set<string>()
        items.forEach((i) => {
          const annotationId = i[fkOnItem]
          if (annotationId !== null && annotationId !== undefined) {
            annotationIds.add(annotationId)
          }
        })

        return annotationEndpoint.query({
          condition: {_id: {Inside: [...annotationIds]}}
        })
      }
    )

    const annotationResponses = await Promise.all(annotationRequests)

    return items.map((i) => ({
      ...i,
      _annotations: annotationKeys.reduce((acc, key, index) => {
        const annotationKey = annotationEndpointKeys[index]
        // @ts-expect-error
        const fkOnItem = referentialSchema[baseKey][annotationKey]
        const annotationResponse = annotationResponses[index]
        const annotation = annotationResponse.find((a) => a._id === i[fkOnItem])
        return {...acc, [key]: annotation}
      }, {})
    }))
  })

  return annotatedEndpoint
}
