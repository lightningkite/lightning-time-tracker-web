import {makeObjectModification} from "@lightningkite/lightning-server-simplified"
import type {Timer, UserSession} from "api/sdk"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import {useContext, useEffect, useReducer} from "react"
import type {TimerContextType} from "../utils/context"
import {AuthContext} from "../utils/context"
import {getTimerSeconds} from "../utils/helpers"
import {useDebounce} from "./useDebounce"
import usePeriodicRefresh from "./usePeriodicRefresh"
import {dateToISO} from "@lightningkite/react-lightning-helpers"

dayjs.extend(duration)

interface TimerChange {
  updates?: Partial<Timer>
  delete?: boolean
  create?: Timer
}

export const useGlobalTimerManager = (): TimerContextType => {
  const {session, currentUser} = useContext(AuthContext)

  const [state, dispatch] = useReducer(reducer, {status: "loading"})

  const debouncedState = useDebounce(state, 1000)
  const refreshTrigger = usePeriodicRefresh(60 * 10)

  function fetchTimers() {
    return session.timer.query({
      condition: {user: {Equal: currentUser._id}}
    })
  }

  useEffect(() => {
    fetchTimers()
      .then((timers) => dispatch({type: "resetValues", lastFetched: timers}))
      .catch((error) => dispatch({type: "error", description: error.message}))
  }, [])

  useEffect(() => {
    syncTimers()
  }, [debouncedState, refreshTrigger])

  async function syncTimers() {
    if (state.status !== "ready") return
    if (Object.keys(state.changes).length === 0) return

    const previous = state.lastFetched ?? (await fetchTimers())

    const changeRequests = makeChangeRequests(previous, state.changes, session)
    const newTimers = applyTimerChanges(previous, state.changes)

    dispatch({type: "resetValues", lastFetched: newTimers})

    await Promise.all(changeRequests).catch(() =>
      fetchTimers().then((timers) =>
        dispatch({type: "resetValues", lastFetched: timers})
      )
    )
  }

  function removeTimer(id: string): void {
    dispatch({type: "modifyChange", id, change: {delete: true}})
  }

  function updateTimer(id: string, updates: Partial<Timer>): void {
    dispatch({type: "modifyChange", id, change: {updates}})
  }

  function startTimer(id: string): void {
    dispatch({
      type: "modifyChange",
      id,
      change: {updates: {lastStarted: new Date().toISOString()}}
    })
  }

  function stopTimer(id: string): void {
    if (state.status !== "ready") return

    const previousTimer = {
      ...(state.lastFetched.find((t) => t._id === id) ?? {}),
      ...(state.changes[id]?.create ?? {}),
      ...(state.changes[id]?.updates ?? {})
    } as Timer

    dispatch({
      type: "modifyChange",
      id,
      change: {
        updates: {
          lastStarted: null,
          accumulatedSeconds: getTimerSeconds(previousTimer)
        }
      }
    })
  }

  function toggleTimer(id: string) {
    if (state.status !== "ready") return

    const timers = applyTimerChanges(state.lastFetched, state.changes)
    timers.forEach((timer) => {
      if (timer._id === id && !timer.lastStarted) startTimer(timer._id)
      else if (timer.lastStarted) stopTimer(timer._id)
    })
  }

  function newTimer(initialValues?: Pick<Timer, "task" | "project">): string {
    if (state.status !== "ready") {
      throw new Error("Timers not ready")
    }

    // Stop any currently running timers
    const timers = applyTimerChanges(state.lastFetched, state.changes)
    timers.forEach((timer) => {
      if (timer.lastStarted) stopTimer(timer._id)
    })

    const newTimerId = crypto.randomUUID()

    const newTimer: Timer = {
      _id: newTimerId,
      user: currentUser._id,
      organization: currentUser.organization,
      lastStarted: new Date().toISOString(),
      accumulatedSeconds: 0,
      task: initialValues?.task ?? null,
      project: initialValues?.project ?? null,
      summary: ""
    }

    dispatch({type: "modifyChange", id: newTimerId, change: {create: newTimer}})

    return newTimerId
  }

  async function submitTimer(id: string) {
    if (state.status !== "ready") {
      throw new Error("Timers not ready")
    }

    const timer = applyTimerChanges(state.lastFetched, state.changes).find(
      (t) => t._id === id
    )

    if (!timer) {
      throw new Error("Timer not found")
    }
    if (!timer.project) {
      throw new Error("Timer has no project")
    }

    await session.timeEntry.insert({
      _id: crypto.randomUUID(),
      task: timer.task,
      project: timer.project,
      organization: currentUser.organization,
      user: currentUser._id,
      summary: timer.summary,
      durationMilliseconds: dayjs
        .duration(getTimerSeconds(timer), "second")
        .asMilliseconds(),
      date: dateToISO(new Date()),
      taskSummary: undefined,
      projectName: undefined,
      organizationName: undefined,
      userName: undefined
    })

    removeTimer(id)
  }

  return {
    timers:
      state.status === "ready"
        ? applyTimerChanges(state.lastFetched, state.changes)
        : undefined,
    removeTimer,
    updateTimer,
    toggleTimer,
    newTimer,
    submitTimer
  }
}

type State =
  | {status: "loading"}
  | {status: "error"; description: string}
  | {
      status: "ready"
      lastFetched: Timer[]
      changes: Record<string, TimerChange>
    }

type Action =
  | {type: "loading"}
  | {type: "error"; description: string}
  | {type: "resetValues"; lastFetched: Timer[]}
  | {type: "modifyChange"; id: string; change: TimerChange}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return {status: "loading"}
    case "error":
      return {status: "error", description: action.description}
    case "resetValues":
      return {
        status: "ready",
        lastFetched: action.lastFetched,
        changes: {}
      }
    case "modifyChange": {
      if (state.status !== "ready") return state
      const newChange = mergeTimerChanges(
        state.changes[action.id] ?? {},
        action.change
      )
      return {
        ...state,
        changes: {
          ...state.changes,
          [action.id]: newChange
        }
      }
    }
  }
}

function mergeTimerChanges(a: TimerChange, b: TimerChange): TimerChange {
  return {
    create: a.create ?? b.create,
    delete: a.delete ?? b.delete,
    updates: {...a.updates, ...b.updates}
  }
}

function applyTimerChanges(
  previous: Timer[],
  changes: Record<string, TimerChange>
): Timer[] {
  let newTimers: Timer[] = previous.map((t) => ({...t}))

  Object.entries(changes).forEach(([id, change]) => {
    const existingTimer = newTimers.find((t) => t._id === id)

    if (change.delete && existingTimer) {
      newTimers = newTimers.filter((t) => t._id !== id)
    } else if (change.create && !existingTimer) {
      newTimers.push({...change.create, ...change.updates})
    } else if (existingTimer) {
      Object.assign(existingTimer, change.updates)
    }
  })

  return newTimers
}

function makeChangeRequests(
  previous: Timer[],
  changes: Record<string, TimerChange>,
  session: UserSession
): Promise<unknown>[] {
  const changeRequests: Promise<unknown>[] = []

  Object.entries(changes).forEach(([id, change]) => {
    const existingTimer = previous.find((t) => t._id === id)

    if (change.delete && existingTimer) {
      changeRequests.push(session.timer.delete(id))
    } else if (change.create && !existingTimer) {
      changeRequests.push(
        session.timer.insert({...change.create, ...change.updates})
      )
    } else if (existingTimer && change.updates) {
      changeRequests.push(
        session.timer.modify(
          id,
          makeObjectModification(existingTimer, change.updates)
        )
      )
    }
  })

  return changeRequests
}

// 012786d5-6a7d-4179-a09b-940da06f4a89
