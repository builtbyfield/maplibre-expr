import type { GlobalStateMap } from "../src"

import { describe, expect, it } from "vitest"

import { syncGlobalState } from "../src"

/** A stand-in for maplibre-gl's Map: throws until the style "loads", like the real one. */
function fakeMap() {
  let loaded = false
  let state: Record<string, unknown> = {}
  const listeners = new Set<() => void>()
  let sets = 0
  const map: GlobalStateMap = {
    getGlobalState: () => state,
    setGlobalStateProperty: (name, value) => {
      if (!loaded)
        throw new Error("Style is not done loading")
      state = { ...state, [name]: value }
      sets++
    },
    on: (_type, listener) => listeners.add(listener),
    off: (_type, listener) => listeners.delete(listener),
  }
  const emitStyleData = (): void => listeners.forEach(listener => listener())
  return {
    map,
    state: () => state,
    sets: () => sets,
    listeners: () => listeners.size,
    load: () => {
      loaded = true
      emitStyleData()
    },
    reload: () => {
      state = {}
      emitStyleData()
    },
    emitStyleData,
  }
}

describe("syncGlobalState", () => {
  it("applies immediately when the style is loaded", () => {
    const fake = fakeMap()
    fake.load()
    syncGlobalState(fake.map, "now", 100)
    expect(fake.state()).toEqual({ now: 100 })
  })

  it("waits for the style instead of throwing", () => {
    const fake = fakeMap()
    expect(() => syncGlobalState(fake.map, "now", 100)).not.toThrow()
    expect(fake.state()).toEqual({})
    fake.load()
    expect(fake.state()).toEqual({ now: 100 })
  })

  it("re-applies after a full style reload clears state", () => {
    const fake = fakeMap()
    fake.load()
    syncGlobalState(fake.map, "now", 100)
    fake.reload()
    expect(fake.state()).toEqual({ now: 100 })
  })

  it("doesn't set again when the value is already current", () => {
    const fake = fakeMap()
    fake.load()
    syncGlobalState(fake.map, "now", 100)
    fake.emitStyleData()
    fake.emitStyleData()
    expect(fake.sets()).toBe(1)
  })

  it("stops listening when stopped", () => {
    const fake = fakeMap()
    const stop = syncGlobalState(fake.map, "now", 100)
    stop()
    expect(fake.listeners()).toBe(0)
    fake.load()
    expect(fake.state()).toEqual({})
  })
})
