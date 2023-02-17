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

export type AnnotationType<
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
  AnnotationType<REFERENTIAL_SCHEMA, BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS>
>

export type UseAnnotatedEndpointReturn<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
> = ReturnType<
  typeof annotateEndpoint<
    TypeOfEndpointKey<BASE_ENDPOINT_KEY>,
    AnnotationType<REFERENTIAL_SCHEMA, BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS>
  >
>

export function useAnnotatedEndpoint<
  REFERENTIAL_SCHEMA extends ReferentialSchemaMustSatisfy,
  BASE_ENDPOINT_KEY extends EndpointKey,
  ANNOTATE_WITH_KEYS extends keyof REFERENTIAL_SCHEMA[BASE_ENDPOINT_KEY]
>(params: {
  baseKey: BASE_ENDPOINT_KEY
  annotateWith: ANNOTATE_WITH_KEYS[]
}): UseAnnotatedEndpointReturn<
  REFERENTIAL_SCHEMA,
  BASE_ENDPOINT_KEY,
  ANNOTATE_WITH_KEYS
> {
  const {baseKey, annotateWith} = params
  const {session, referentialSchema} = useContext(AnnotatedEndpointContext)

  if (!session || !referentialSchema) {
    console.error(
      "AnnotatedEndpointProvider not found in context. Wrap your App component in AnnotatedEndpointProvider"
    )
    throw new Error(
      "useAnnotatedEndpoint must be used within a AnnotatedEndpointProvider"
    )
  }

  type BaseItemType = TypeOfEndpointKey<BASE_ENDPOINT_KEY>
  type ItemAnnotationType = AnnotationType<
    REFERENTIAL_SCHEMA,
    BASE_ENDPOINT_KEY,
    ANNOTATE_WITH_KEYS
  >

  const baseEndpoint = session[baseKey]

  const endpointKeysForAnnotations = annotateWith.map(
    (key) => referentialSchema[baseKey][key]
  ) as EndpointKey[]

  const annotatedEndpoint = annotateEndpoint<
    BaseItemType,
    AnnotationType<REFERENTIAL_SCHEMA, BASE_ENDPOINT_KEY, ANNOTATE_WITH_KEYS>
  >(baseEndpoint, async (baseItems) => {
    const annotationRequests: Promise<HasId[]>[] =
      endpointKeysForAnnotations.map((annotationKey) => {
        const annotationEndpoint = session[
          annotationKey
        ] as SessionRestEndpoint<any>

        const foreignKeyProperty: keyof BaseItemType =
          // @ts-expect-error
          referentialSchema[baseKey][annotationKey]

        const annotatedModelIds = new Set<string>()
        baseItems.forEach((item) => {
          const foreignKey = item[foreignKeyProperty]
          if (foreignKey !== null && foreignKey !== undefined) {
            annotatedModelIds.add(foreignKey as string)
          }
        })

        return annotationEndpoint.query({
          condition: {_id: {Inside: [...annotatedModelIds]}}
        })
      })

    const annotationResponses = await Promise.all(annotationRequests)

    return baseItems.map((item) => {
      const itemAnnotation = annotateWith.reduce(
        (acc, annotateWithKey, index) => {
          const annotationKey = endpointKeysForAnnotations[index]
          const foreignKeyProperty: keyof BaseItemType =
            // @ts-expect-error
            referentialSchema[baseKey][annotationKey]
          const annotationResponse = annotationResponses[index]
          const annotation = annotationResponse.find(
            (a) => a._id === item[foreignKeyProperty]
          )
          return {...acc, [annotateWithKey]: annotation}
        },
        {}
      ) as ItemAnnotationType

      return {
        ...item,
        _annotations: itemAnnotation
      }
    })
  })

  return annotatedEndpoint
}
