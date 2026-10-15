import type { Expr, ExprLike, Typed } from "../expr"

import { op } from "../internal"

/** The output type of a value bound by {@link let_}. */
export type OutputOf<V> = V extends Typed<infer U> ? (unknown extends U ? any : U)
  : V extends number ? number
    : V extends string ? string
      : V extends boolean ? boolean
        : any

/** References to the variables bound by {@link let_}, keyed by name. */
export type VarRefs<V> = { readonly [K in keyof V]: Expr<OutputOf<V[K]>> }

/**
 * Binds values to names, so an expensive or repeated sub-expression is
 * written (and evaluated) once. The callback receives typed `var`
 * references. MapLibre `let` / `var`.
 *
 * Named `let_` because `let` is a reserved word.
 *
 * @example
 * let_({ density: divide(get("population"), get("area")) }, ({ density }) =>
 *   interpolate(linear(), density, [[0, "#fff"], [1000, "#f00"]]))
 * // ["let", "density", ["/", ...], ["interpolate", ["linear"], ["var", "density"], 0, "#fff", 1000, "#f00"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#let
 */
export function let_<const V extends Record<string, unknown>, T>(vars: V, body: (refs: VarRefs<V>) => ExprLike<T>): Expr<T> {
  const names = Object.keys(vars)
  if (names.length === 0)
    throw new RangeError("let_: bind at least one variable")
  const refs = Object.fromEntries(names.map(name => [name, var_(name)])) as VarRefs<V>
  return op("let", ...names.flatMap(name => [name, vars[name]]), body(refs))
}

/**
 * A reference to a variable bound by an enclosing `let`. With {@link let_}
 * you get these as typed callback arguments instead. MapLibre `var`.
 *
 * Named `var_` because `var` is a reserved word.
 *
 * @see https://maplibre.org/maplibre-style-spec/expressions/#var
 */
export function var_<T = any>(name: string): Expr<NoInfer<T>> {
  return op("var", name)
}
