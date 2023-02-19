// THIS FILE NEEDS TO BE GENERATED BY LIGHTNING SERVER

import {
  annotateEndpoint,
  AnnotateEndpointReturn,
  Condition,
  HasId,
  SessionRestEndpoint,
  WithAnnotations
} from "@lightningkite/lightning-server-simplified"
import {createContext, FC, PropsWithChildren, useContext} from "react"
import {UserSession} from "./sdk"

export const relationalSchema = {
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
} satisfies RelationalSchemaMustSatisfy

type RelationalSchemaMustSatisfy = {
  [P in CollectionKey]: Partial<
    Record<keyof TypeOfCollectionKey<P>, CollectionKey>
  >
}

type RelationalSchema = typeof relationalSchema

export interface AnnotatedEndpointContextType {
  session: UserSession
}

export const AnnotatedEndpointContext = createContext(
  {} as AnnotatedEndpointContextType
)

export const AnnotatedEndpointContextProvider: FC<
  PropsWithChildren<AnnotatedEndpointContextType>
> = (props) => (
  <AnnotatedEndpointContext.Provider
    value={{
      session: props.session
    }}
  >
    {props.children}
  </AnnotatedEndpointContext.Provider>
)

/** Check that type has all keys of SessionRestEndpoint */
type CollectionEndpoints<T extends HasId> = Record<
  keyof SessionRestEndpoint<T>,
  any
>

/** Picks all the keys of UserSession that are rest endpoints */
export type CollectionKey = keyof Pick<
  UserSession,
  {
    [K in keyof UserSession]: UserSession[K] extends CollectionEndpoints<any>
      ? K
      : never
  }[keyof UserSession]
>

/**
 * Gets the model type of a collection
 *
 * Example:
 * ```ts
 * TypeOfEndpointKey<"organization">
 * // Organization
 * ```
 */
export type TypeOfCollectionKey<K extends CollectionKey> = Awaited<
  ReturnType<UserSession[K]["detail"]>
>

// Makes a string plural
type Pluralize<T extends string> = T extends `${infer S}y` ? `${S}ies` : `${T}s`

type PluralKeys<T extends Record<string, any>> = {
  // @ts-expect-error
  [K in keyof T as Pluralize<K>]: T[K]
}

/** Type of the annotation of the model used by annotated endpoint */
type AnnotationType<
  BASE_COLLECTION_KEY extends CollectionKey,
  WITH_PROPERTIES extends keyof RelationalSchema[BASE_COLLECTION_KEY],
  INCLUDE_RELATIONS extends IncludeRelations
> = {
  [K in WITH_PROPERTIES]:
    | undefined
    | TypeOfCollectionKey<
        // @ts-expect-error
        RelationalSchema[BASE_COLLECTION_KEY][K]
      >
} & PluralKeys<{
  // @ts-expect-error
  [K in keyof INCLUDE_RELATIONS]: TypeOfCollectionKey<K>[]
}>

/** Type of the model used by the annotated endpoint */
export type AnnotatedItem<
  BASE_COLLECTION_KEY extends CollectionKey,
  WITH_PROPERTIES extends keyof RelationalSchema[BASE_COLLECTION_KEY],
  INCLUDE_RELATIONS extends IncludeRelations
> = WithAnnotations<
  TypeOfCollectionKey<BASE_COLLECTION_KEY>,
  AnnotationType<BASE_COLLECTION_KEY, WITH_PROPERTIES, INCLUDE_RELATIONS>
>

type IncludeRelation<INCLUDE_COLLECTION_KEY extends CollectionKey> = {
  condition?: Condition<TypeOfCollectionKey<INCLUDE_COLLECTION_KEY>>
  relationProperty: keyof RelationalSchema[INCLUDE_COLLECTION_KEY]
  // as: string
}

type IncludeRelations = {
  [K in keyof RelationalSchema]?: IncludeRelation<K>
}

/** This is the limited set of endpoint keys available when using an annotated endpoint */
type AnnotatedEndpointKeys<
  BASE_COLLECTION_KEY extends CollectionKey,
  WITH_PROPERTIES extends keyof RelationalSchema[BASE_COLLECTION_KEY],
  INCLUDE_RELATIONS extends IncludeRelations
> = keyof AnnotateEndpointReturn<
  TypeOfCollectionKey<BASE_COLLECTION_KEY>,
  AnnotationType<BASE_COLLECTION_KEY, WITH_PROPERTIES, INCLUDE_RELATIONS>
>

// !! Don't try to simplify this by writing AnnotateEndpointReturn<...> without pick. It should work, but types start being inferred as any.
/** Return type of `useAnnotatedEndpoint` */
export type UseAnnotatedEndpointReturn<
  BASE_COLLECTION_KEY extends CollectionKey,
  WITH_PROPERTIES extends keyof RelationalSchema[BASE_COLLECTION_KEY],
  INCLUDE_RELATIONS extends IncludeRelations
> = Pick<
  SessionRestEndpoint<
    AnnotatedItem<BASE_COLLECTION_KEY, WITH_PROPERTIES, INCLUDE_RELATIONS>
  >,
  AnnotatedEndpointKeys<BASE_COLLECTION_KEY, WITH_PROPERTIES, INCLUDE_RELATIONS>
>

export function useAnnotatedEndpoint<
  BASE_COLLECTION_KEY extends CollectionKey,
  WITH_PROPERTIES extends keyof RelationalSchema[BASE_COLLECTION_KEY] = never,
  INCLUDE_RELATIONS extends IncludeRelations = {}
>(params: {
  collection: BASE_COLLECTION_KEY
  with?: WITH_PROPERTIES[]
  include?: INCLUDE_RELATIONS
}): UseAnnotatedEndpointReturn<
  BASE_COLLECTION_KEY,
  WITH_PROPERTIES,
  INCLUDE_RELATIONS
> {
  const {collection, with: withProperties = []} = params
  const {session} = useContext(AnnotatedEndpointContext)

  if (!session || !relationalSchema) {
    console.error(
      "AnnotatedEndpointProvider not found in context. Wrap your App component in AnnotatedEndpointProvider"
    )
    throw new Error(
      "useAnnotatedEndpoint must be used within a AnnotatedEndpointProvider"
    )
  }

  type BaseCollectionName = TypeOfCollectionKey<BASE_COLLECTION_KEY>
  type ItemAnnotationType = AnnotationType<
    BASE_COLLECTION_KEY,
    WITH_PROPERTIES,
    INCLUDE_RELATIONS
  >

  const baseEndpoint = session[collection]

  const annotatedEndpoint = annotateEndpoint<
    BaseCollectionName,
    AnnotationType<BASE_COLLECTION_KEY, WITH_PROPERTIES, INCLUDE_RELATIONS>
  >(baseEndpoint, async (baseItems) => {
    // Promises for each annotation
    const withRequests: Array<Promise<HasId[]>> = withProperties.map(
      (property) => {
        const withEndpointKey = relationalSchema[collection][
          property
        ] as keyof UserSession

        const withEndpoint = session[
          withEndpointKey
        ] as SessionRestEndpoint<HasId>

        const withIdsToFetch = baseItems
          .map((item) => item[property as keyof BaseCollectionName])
          .filter((item) => item !== null && item !== undefined) as string[]

        return withEndpoint.query({
          condition: {_id: {Inside: [...new Set(withIdsToFetch)]}}
        })
      },
      {}
    )

    const withResponses = await Promise.all(withRequests)

    return baseItems.map((item) => {
      const itemAnnotation = {}

      withProperties.forEach((withProperty, index) => {
        const withResponse = withResponses[index]
        const withAnnotation = withResponse.find(
          (a) => a._id === item[withProperty as keyof BaseCollectionName]
        )

        // @ts-expect-error
        itemAnnotation[withProperty] = withAnnotation
      })

      return {
        ...item,
        _annotations: itemAnnotation as ItemAnnotationType
      }
    })
  })

  return annotatedEndpoint
}
