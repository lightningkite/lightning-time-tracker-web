import {randUuid} from "@ngneat/falso"
import {Organization} from "api/sdk"
import {dateToISO} from "utils/helpers"

export function generateOrganizations(total: number): Organization[] {
  return Array.from({length: total}, () => {
    return {
      _id: randUuid(),
      name: "Lightning Kite",
      owner: "",
      createdAt: dateToISO(new Date())
    }
  })
}
