import type { Expr } from "./expr"

import { op } from "./internal"

type Key<P> = keyof P & string
/**
 * The type a value has when present. Any property or state can be missing at
 * runtime, so `null` and `undefined` in a declared type add nothing; dropping
 * them lets types like a zod schema's inferred output (every field nullable)
 * be used as they are.
 */
export type Present<T> = NonNullable<T>
type PrimitiveKey<P> = { [K in Key<P>]: NonNullable<P[K]> extends string | number | boolean ? K : never }[Key<P>]

/** Feature property accessors checked against a declared shape. See {@link typedProperties}. */
export interface TypedProperties<P> {
  /** The property's value, or `null` if missing. MapLibre `get`. */
  get: <K extends Key<P>>(name: K) => Expr<Present<P[K]>>
  /** `true` if the feature has the property. MapLibre `has`. */
  has: <K extends Key<P>>(name: K) => Expr<boolean>
  /**
   * The property's value, or `fallback` if it's missing or isn't the
   * fallback's type (string, number or boolean).
   */
  getOr: <K extends PrimitiveKey<P>>(name: K, fallback: Present<P[K]>) => Expr<Present<P[K]>>
}

/** Feature-state accessors checked against a declared shape. See {@link typedFeatureState}. */
export interface TypedFeatureState<S> {
  /** The state's value, or `null` if unset. MapLibre `feature-state`. */
  get: <K extends Key<S>>(name: K) => Expr<Present<S[K]>>
}

/** Global-state accessors checked against a declared shape. See {@link typedGlobalState}. */
export interface TypedGlobalState<G> {
  /** The global state's value, or `null` if unset. MapLibre `global-state`. */
  get: <K extends Key<G>>(name: K) => Expr<Present<G[K]>>
}

/**
 * Property accessors for features of a known shape, so misspelled property
 * names are compile errors and values are typed. They emit the same
 * `["get", ...]` / `["has", ...]` arrays as {@link get} and {@link has}.
 *
 * Values are typed as the property's type *when present*: `null` and
 * `undefined` in the declared type are dropped (see {@link Present}), so a
 * zod schema's inferred type works as is. A missing property is still `null`
 * at runtime; use `getOr` or {@link coalesce} for that.
 *
 * @example
 * interface Place { "name": string, "rank": number, "kind": "park" | "lake" }
 * const place = typedProperties<Place>()
 * gt(place.get("rank"), 3)      // ["get", "rank"] typed as number
 * eq(place.get("kind"), "lake") // "lak" would be a compile error
 * place.get("rnak")             // compile error
 */
export function typedProperties<P>(): TypedProperties<P> {
  return {
    get: name => op("get", name),
    has: name => op("has", name),
    getOr: (name, fallback) => op(typeof fallback, op("get", name), fallback),
  }
}

/**
 * Feature-state accessors for a known state shape, so misspelled state names
 * are compile errors. Emits `["feature-state", ...]`, like
 * {@link featureState}.
 *
 * @example
 * const state = typedFeatureState<{ hover: boolean, selected: boolean }>()
 * case_([[boolean(state.get("hover"), false), "#f80"]], "#888")
 */
export function typedFeatureState<S>(): TypedFeatureState<S> {
  return { get: name => op("feature-state", name) }
}

/**
 * Global-state accessors for a known state shape, so misspelled names are
 * compile errors. Emits `["global-state", ...]`, like {@link globalState}.
 *
 * @example
 * const app = typedGlobalState<{ now: number, minRank: number }>()
 * gt(get("ends_at"), app.get("now"))
 */
export function typedGlobalState<G>(): TypedGlobalState<G> {
  return { get: name => op("global-state", name) }
}
