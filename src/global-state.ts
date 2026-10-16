/** The parts of a maplibre-gl `Map` (5.6+) that {@link syncGlobalState} uses. */
export interface GlobalStateMap {
  getGlobalState: () => Record<string, unknown>
  setGlobalStateProperty: (name: string, value: unknown) => unknown
  on: (type: "styledata", listener: () => void) => unknown
  off: (type: "styledata", listener: () => void) => unknown
}

/**
 * Keeps a global-state property set on a map, for expressions that read it
 * with `globalState(name)`. Sets it now and again whenever the style
 * changes, which handles the two cases where a plain
 * `map.setGlobalStateProperty` call goes wrong:
 *
 * - it throws "Style is not done loading" if called before the style loads
 *   (here the first `styledata` event applies it instead);
 * - a full style reload (`setStyle` without `diff`) starts with empty state.
 *
 * A `value` of `null` resets the property to its default from the style's
 * `state` section, as `setGlobalStateProperty` does.
 *
 * Returns a function that stops syncing. To change the value, stop and sync
 * again (in React, call it from an effect that depends on the value).
 *
 * @example
 * // filter: gt(get("ends_at"), globalState("now"))
 * let stop = syncGlobalState(map, "now", Date.now())
 * setInterval(() => { stop(); stop = syncGlobalState(map, "now", Date.now()) }, 60_000)
 * @example
 * // React
 * useEffect(() => syncGlobalState(map, "now", now), [map, now])
 */
export function syncGlobalState(map: GlobalStateMap, name: string, value: unknown): () => void {
  const apply = (): void => {
    try {
      if (map.getGlobalState()[name] !== value)
        map.setGlobalStateProperty(name, value)
    }
    catch {
      // The style isn't loaded yet; the next `styledata` event retries.
    }
  }
  apply()
  map.on("styledata", apply)
  return () => {
    map.off("styledata", apply)
  }
}
