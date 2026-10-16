import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import type { OperatorName } from "./operator-names"

declare const output: unique symbol
declare const kind: unique symbol

/** Records what an expression evaluates to. Type-only. */
export interface Typed<T> {
  readonly [output]?: T
}

/**
 * A MapLibre expression that evaluates to `T`. At runtime it's a plain
 * style-spec array, usable anywhere MapLibre accepts an expression.
 *
 * Statically it's typed as a single member of `ExpressionSpecification`
 * (`["literal", unknown]`), which keeps type-checking fast. Use
 * {@link toSpec} to inspect the actual array.
 */
export type Expr<T = unknown> = ["literal", unknown] & Typed<T>

/**
 * An expression producing `T`, or a raw expression array like
 * `["get", "name"]` (only its operator name is checked).
 */
export type ExprLike<T = unknown> = (readonly [OperatorName, ...unknown[]]) & Typed<T>

/** A literal of type `T` or an expression producing `T`. */
export type Input<T> = T | ExprLike<T>

/** Evaluates to a color. */
export interface Color { readonly [kind]: "color" }
/** Evaluates to rich text. Produced by `format`. */
export interface Formatted { readonly [kind]: "formatted" }
/** Evaluates to an image reference. Produced by `image`. */
export interface ResolvedImage { readonly [kind]: "resolved-image" }
/** A locale-aware string comparator. Produced by `collator`. */
export interface Collator { readonly [kind]: "collator" }
/** Evaluates to a map projection (or a blend of two). Produced by projection ramps. */
export interface Projection { readonly [kind]: "projection" }

/** A projection usable as a ramp output. */
export type ProjectionName = "mercator" | "vertical-perspective"
/** A projection name, or an expression producing a projection. */
export type ProjectionInput = ProjectionName | ExprLike<Projection>
/** An expression producing an array of colors, e.g. `literal(["#000", "#fff"])`. */
export type ColorArrayInput = ExprLike<readonly (Color | string)[]>

/** A number or numeric expression. */
export type NumberInput = Input<number>
/** A string or string expression. */
export type StringInput = Input<string>
/** A boolean or boolean expression. */
export type BooleanInput = Input<boolean>
/** A CSS color string or a color (or string) expression. */
export type ColorInput = string | ExprLike<Color | string>
/** An expression producing an array whose items are `T`. */
export type ArrayInput<T = unknown> = ExprLike<readonly T[]>
/** An expression producing a JSON object. */
export type ObjectInput = ExprLike<Record<string, unknown>>
/** Any literal or expression (for operators that accept every type). */
export type AnyInput = unknown

/** Values that can be written literally inside an expression. */
export type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue }

/**
 * Views an expression as MapLibre's `ExpressionSpecification`, e.g. to
 * inspect its operator and arguments.
 *
 * @example toSpec(add(1, 2))[0] // "+"
 */
export function toSpec(expression: ExprLike): ExpressionSpecification {
  return expression as unknown as ExpressionSpecification
}
