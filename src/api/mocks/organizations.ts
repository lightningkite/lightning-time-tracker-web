import {randUuid} from "@ngneat/falso"
import {Organization} from "api/sdk"

export function generateOrganizations(total: number): Organization[] {
  return Array.from({length: total}, () => {
    return {
      _id: randUuid(),
      name: "Lightning Kite",
      owner: "",
      createdAt: new Date().toISOString()
    }
  })
}
