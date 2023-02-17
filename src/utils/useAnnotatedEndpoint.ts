import {
  annotateEndpoint,
  HasId,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {UserSession} from "api/sdk"
import {useContext} from "react"
import {
  AnnotatedEndpointContext,
  ReferentialSchemaMustSatisfy
} from "./AnnotatedEndpointProvider"

// TODO: require app be wrapped in context provider to provide session and referential schema, type with referential schema type when using hook

/** Check that type has all keys of SessionRestEndpoint */
type IsSessionRestEndpoint<T extends HasId> = Record<
  keyof SessionRestEndpoint<T>,
  any
>

/** Picks all the keys of UserSession that are rest endpoints */
export type EndpointKey = keyof Pick<
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
export type TypeOfEndpointKey<K extends EndpointKey> = Awaited<
  ReturnType<UserSession[K]["detail"]>
>

export type JoinedQueryAnnotation<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
> = {
  [A in ANNOTATE_WITH_KEYS]:
    | undefined
    | TypeOfEndpointKey<
        // @ts-expect-error
        ReferentialSchema[BASE_ENDPOINT_KEY][A]
      >
}

export type AnnotatedItemType<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
> = WithAnnotations<
  TypeOfEndpointKey<BASE_ENDPOINT_KEY>,
  JoinedQueryAnnotation<
    REFERENTIAL_SCHEMA,
    BASE_ENDPOINT_KEY,
    ANNOTATE_WITH_KEYS
  >
>

export type UseAnnotatedEndpointReturn<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
> = ReturnType<
  typeof annotateEndpoint<
    TypeOfEndpointKey<BASE_ENDPOINT_KEY>,
    JoinedQueryAnnotation<
      REFERENTIAL_SCHEMA,
      BASE_ENDPOINT_KEY,
      ANNOTATE_WITH_KEYS
    >
  >
>

export function useAnnotatedEndpoint<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
>(params: {
  baseKey: BASE_ENDPOINT_KEY
  annotationKeys: ANNOTATE_WITH_KEYS[]
}): UseAnnotatedEndpointReturn<
  REFERENTIAL_SCHEMA,
  BASE_ENDPOINT_KEY,
  ANNOTATE_WITH_KEYS
> {
  const {baseKey, annotationKeys} = params
  const {session, referentialSchema} = useContext(AnnotatedEndpointContext)

  if (!session || !referentialSchema) {
    console.error(
      "AnnotatedEndpointProvider not found in context. Wrap your App component in AnnotatedEndpointProvider"
    )
    throw new Error(
      "useAnnotatedEndpoint must be used within a AnnotatedEndpointProvider"
    )
  }

  const baseEndpoint = session[baseKey]

  const annotatedEndpoint = annotateEndpoint(baseEndpoint, async (items) => {
    const annotationEndpointKeys = annotationKeys.map(
      (key) => referentialSchema[baseKey][key]
    ) as unknown as EndpointKey[]

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
