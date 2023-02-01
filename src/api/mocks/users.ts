import {
  randAvatar,
  randEmail,
  randFullName,
  randPastDate,
  randPhoneNumber,
  randUuid
} from "@ngneat/falso"
import {User} from "api/sdk"
import {dateToISO} from "utils/helpers"

export function generateUsers(total: number): User[] {
  return Array.from({length: total}, () => ({
    _id: randUuid(),
    name: randFullName(),
    email: randEmail(),
    phone: randPhoneNumber(),
    birthday: dateToISO(randPastDate({years: 100})),
    profilePic: randAvatar(),
    createdAt: dateToISO(randPastDate()),
    modifiedAt: dateToISO(randPastDate())
  }))
}
