import {UserSession} from "api/sdk"
import React, {createContext, FC, PropsWithChildren} from "react"
import {EndpointKey, TypeOfEndpointKey} from "./useAnnotatedEndpoint"

// TODO: this goes in the lightning server simplified package
export type ReferentialSchemaMustSatisfy = {
  [P in EndpointKey]: Partial<Record<keyof TypeOfEndpointKey<P>, EndpointKey>>
}

export interface AnnotatedEndpointContextType {
  session: UserSession
  referentialSchema: ReferentialSchemaMustSatisfy
}

export const AnnotatedEndpointContext = createContext(
  {} as AnnotatedEndpointContextType
)

export const AnnotatedEndpointContextProvider: FC<
  PropsWithChildren<AnnotatedEndpointContextType>
> = (props) => (
  <AnnotatedEndpointContext.Provider
    value={{
      session: props.session,
      referentialSchema: props.referentialSchema
    }}
  >
    {props.children}
  </AnnotatedEndpointContext.Provider>
)
