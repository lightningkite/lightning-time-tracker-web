import {randUuid} from "@ngneat/falso"
import type {Organization} from "api/sdk"

export function generateOrganizations(total: number): Organization[] {
  return Array.from({length: total}, () => {
    return {
      _id: randUuid(),
      name: "Lightning Kite",
      createdAt: new Date().toISOString()
    }
  })
}
