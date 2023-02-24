// Change the prefix (react-starter) of these keys to avoid collisions with other projects running on localhost
export enum LocalStorageKey {
  USER_TOKEN = "lk-time-userToken",
  BACKEND_URL = "lk-time-backendURL",
  TIMERS = "lk-time-timers"
}

export const QUERY_LIMIT = 10_000;