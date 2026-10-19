import type {
  AnyInput,
  BooleanInput,
  Collator,
  Color,
  ColorInput,
  Expr,
  ExprLike,
  Formatted,
  JsonValue,
  NumberInput,
  ResolvedImage,
  StringInput,
} from "../expr"

import { op } from "../internal"
import { isExpression } from "../operator-names"

/**
 * Wraps a JSON array or object so MapLibre treats it as data rather than as
 * a nested expression. Required for any array or object value inside an
 * expression. MapLibre `literal`.
 *
 * @example in_(get("type"), literal(["park", "forest"]))
 * @example literal({ a: 1 }) // ["literal", { a: 1 }]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#literal
 */
export function literal<const T extends readonly JsonValue[] | { readonly [key: string]: JsonValue }>(value: T): Expr<T> {
  return op("literal", value)
}

/**
 * Like {@link literal} for arrays, but elements may be expressions; they are
 * evaluated. MapLibre `semiliteral`.
 *
 * Requires MapLibre GL JS 6.6+. The style spec lists it as not yet supported
 * in MapLibre Native; see
 * https://github.com/maplibre/maplibre-native/issues/4401.
 *
 * @example semiliteral([get("x"), get("y")]) // ["semiliteral", [["get", "x"], ["get", "y"]]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#semiliteral
 */
export function semiliteral<T>(values: readonly (T | ExprLike<T>)[]): Expr<T[]> {
  return op("semiliteral", values)
}

/** Item types accepted by {@link array}. */
export interface ArrayItemTypes {
  string: string
  number: number
  boolean: boolean
}

/**
 * Asserts that `value` is an array, optionally of a given item type and
 * length. If the assertion fails, evaluation of the whole expression fails.
 * MapLibre `array`.
 *
 * @example array(get("tags")) // ["array", ["get", "tags"]]
 * @example array("number", 2, get("offset")) // ["array", "number", 2, ["get", "offset"]]
 * @see https://maplibre.org/maplibre-style-spec/expressions/#array
 */
export function array(value: AnyInput): Expr<readonly unknown[]>
export function array<K extends keyof ArrayItemTypes>(itemType: K, value: AnyInput): Expr<readonly ArrayItemTypes[K][]>
export function array<K extends keyof ArrayItemTypes>(itemType: K, length: number, value: AnyInput): Expr<readonly ArrayItemTypes[K][]>
export function array(...args: unknown[]): Expr<readonly unknown[]> {
  return op("array", ...args)
}

/**
 * What {@link typeof_} can return. Arrays include their item type and
 * length, like `"array<number, 3>"` or `"array<value, 0>"`.
 */
export type TypeName
  = | "null"
    | "number"
    | "string"
    | "boolean"
    | "color"
    | "object"
    | "formatted"
    | "resolvedImage"
    | "padding"
    | "numberArray"
    | "colorArray"
    | "projectionDefinition"
    | "variableAnchorOffsetCollection"
    | "array"
    | `array<${string}>`

/**
 * The type of `value` as a string, like `"number"`, `"null"` or
 * `"array<number, 3>"`; see {@link TypeName}. Comparing against a misspelled
 * name is a type error. MapLibre `typeof`.
 *
 * Named `typeof_` because `typeof` is a reserved word.
 *
 * @example eq(typeof_(get("height")), "number")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#typeof
 */
export function typeof_(value: AnyInput): Expr<TypeName> {
  return op("typeof", value)
}

/**
 * Asserts that the value is a string. With several inputs, returns the first
 * that is a string; evaluation fails if none are. MapLibre `string`.
 *
 * @example string(get("name"), "") // name, or "" if it's not a string
 * @see https://maplibre.org/maplibre-style-spec/expressions/#string
 */
export function string(...values: [AnyInput, ...AnyInput[]]): Expr<string> {
  return op("string", ...values)
}

/**
 * Asserts that the value is a number. With several inputs, returns the first
 * that is a number; evaluation fails if none are. MapLibre `number`.
 *
 * @example number(get("height"), 0)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#number
 */
export function number(...values: [AnyInput, ...AnyInput[]]): Expr<number> {
  return op("number", ...values)
}

/**
 * Asserts that the value is a boolean. With several inputs, returns the first
 * that is a boolean; evaluation fails if none are. MapLibre `boolean`.
 *
 * @example boolean(featureState("hover"), false)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#boolean
 */
export function boolean(...values: [AnyInput, ...AnyInput[]]): Expr<boolean> {
  return op("boolean", ...values)
}

/**
 * Asserts that the value is a JSON object. With several inputs, returns the
 * first that is an object; evaluation fails if none are. MapLibre `object`.
 *
 * @see https://maplibre.org/maplibre-style-spec/expressions/#object
 */
export function object(...values: [AnyInput, ...AnyInput[]]): Expr<Record<string, unknown>> {
  return op("object", ...values)
}

/** Options of {@link collator}. */
export interface CollatorOptions {
  /** Treat upper and lower case as different. Default `false`. */
  "case-sensitive"?: BooleanInput
  /** Treat characters with different diacritics as different. Default `false`. */
  "diacritic-sensitive"?: BooleanInput
  /** IETF language tag, like `"en"`. Defaults to the system locale. */
  "locale"?: StringInput
}

/**
 * A locale-aware string comparator, for use with {@link eq}, {@link lt},
 * etc. and {@link resolvedLocale}. MapLibre `collator`.
 *
 * @example eq(get("name"), "paris", collator({ "case-sensitive": false }))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#collator
 */
export function collator(options: CollatorOptions = {}): Expr<Collator> {
  return op("collator", options)
}

/** Per-section style overrides of {@link format}. */
export interface FormatOptions {
  /** Font stack for this section. A plain array is wrapped in `literal` for you. */
  "text-font"?: readonly string[] | ExprLike<readonly string[]>
  /** Text color for this section. */
  "text-color"?: ColorInput
  /** Multiplier on the layer's `text-size`. */
  "font-scale"?: NumberInput
  /** Vertical alignment of this section within its line. */
  "vertical-align"?: "bottom" | "center" | "top" | ExprLike<string>
}

/** One section of {@link format}: text or an image, optionally with overrides. */
export type FormatSection = StringInput | ExprLike<ResolvedImage> | readonly [StringInput | ExprLike<ResolvedImage>, FormatOptions]

/**
 * Rich text for `text-field`: a sequence of text and image sections, each
 * with optional style overrides. MapLibre `format`.
 *
 * A section with overrides is a `[content, options]` pair. A two-element
 * array whose first element is an operator name (like `["get", "name"]`) is
 * read as a raw expression instead, so for literal text equal to an operator
 * name, wrap it: `[toString("get"), options]`.
 *
 * @example
 * format(
 *   [get("name"), { "font-scale": 1.2 }],
 *   "\n",
 *   [get("subtitle"), { "font-scale": 0.8, "text-color": "#666" }],
 * )
 * @see https://maplibre.org/maplibre-style-spec/expressions/#format
 */
export function format(...sections: [FormatSection, ...FormatSection[]]): Expr<Formatted> {
  const args: unknown[] = []
  for (const section of sections) {
    if (isSectionWithOptions(section)) {
      const [content, options] = section
      const font = options["text-font"]
      // The spec requires `text-font` overrides to be expressions; wrap plain font stacks.
      args.push(content, font !== undefined && !isExpression(font) ? { ...options, "text-font": ["literal", font] } : options)
    }
    else {
      args.push(section)
    }
  }
  return op("format", ...args)
}

/**
 * A reference to an image in the style's sprite, for `icon-image`,
 * `*-pattern` or a {@link format} section. Evaluates to `null` inside
 * {@link coalesce} if the image is unavailable. MapLibre `image`.
 *
 * @example coalesce(image(concat(get("icon"), "-15")), image("default-15"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#image
 */
export function image(name: StringInput): Expr<ResolvedImage> {
  return op("image", name)
}

/** Options of {@link numberFormat}. `currency` and `unit` are mutually exclusive. */
export type NumberFormatOptions = {
  /** BCP 47 language tag, like `"de-DE"`. */
  "locale"?: StringInput
  /** Minimum number of fraction digits. */
  "min-fraction-digits"?: NumberInput
  /** Maximum number of fraction digits. */
  "max-fraction-digits"?: NumberInput
} & (
  | { /** ISO 4217 currency code, like `"EUR"`. */ currency?: StringInput, unit?: never }
  | {
    /**
     * CLDR/ECMA-402 unit, like `"kilometer"`. Requires MapLibre GL JS 5.20+;
     * not yet in MapLibre Native (https://github.com/maplibre/maplibre-native/issues/4071).
     */
    unit?: StringInput
    currency?: never
  }
)

/**
 * Formats a number as a localized string. MapLibre `number-format`.
 *
 * @example numberFormat(get("price"), { currency: "EUR", locale: "de-DE" })
 * @example numberFormat(get("km"), { "unit": "kilometer", "max-fraction-digits": 1 })
 * @see https://maplibre.org/maplibre-style-spec/expressions/#number-format
 */
export function numberFormat(input: NumberInput, options: NumberFormatOptions): Expr<string> {
  // MapLibre ignores a literal 0 here (it tests the option for truthiness); an expression 0 works.
  const fixed = { ...options }
  for (const key of ["min-fraction-digits", "max-fraction-digits"] as const) {
    if (fixed[key] === 0)
      fixed[key] = ["literal", 0] as unknown as NumberInput
  }
  return op("number-format", input, fixed)
}

/**
 * Converts any value to a string: `null` becomes `""`, colors become
 * `"rgba(r,g,b,a)"`, objects and arrays become JSON. MapLibre `to-string`.
 *
 * @example concat(toString(get("floors")), " floors")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#to-string
 */
export function toString(value: AnyInput): Expr<string> {
  return op("to-string", value)
}

/**
 * Converts to a number, trying each input in turn: `null` and `false` are 0,
 * `true` is 1, numeric strings are parsed (and `""` is 0, not a failure).
 * Evaluation fails if none convert.
 * MapLibre `to-number`.
 *
 * @example toNumber(get("height_str"), 0)
 * @see https://maplibre.org/maplibre-style-spec/expressions/#to-number
 */
export function toNumber(...values: [AnyInput, ...AnyInput[]]): Expr<number> {
  return op("to-number", ...values)
}

/**
 * Converts to a boolean: `""`, `0`, `false`, `null` and `NaN` are false,
 * everything else is true, including the string `"false"`. MapLibre `to-boolean`.
 *
 * @example toBoolean(get("name"))
 * @see https://maplibre.org/maplibre-style-spec/expressions/#to-boolean
 */
export function toBoolean(value: AnyInput): Expr<boolean> {
  return op("to-boolean", value)
}

/**
 * Converts to a color, trying each input in turn (CSS color strings or
 * `[r, g, b]`/`[r, g, b, a]` arrays). Evaluation fails if none convert.
 * MapLibre `to-color`.
 *
 * MapLibre reads `[r, g, b, a]` arrays as premultiplied: for a translucent
 * color, multiply r, g and b by a first (`[127.5, 0, 0, 0.5]` is
 * half-transparent red).
 *
 * @example toColor(get("color"), "#888")
 * @see https://maplibre.org/maplibre-style-spec/expressions/#to-color
 */
export function toColor(...values: [AnyInput, ...AnyInput[]]): Expr<Color> {
  return op("to-color", ...values)
}

function isSectionWithOptions(section: FormatSection): section is readonly [StringInput | ExprLike<ResolvedImage>, FormatOptions] {
  return Array.isArray(section)
    && !isExpression(section)
    && section.length === 2
    && typeof section[1] === "object"
    && section[1] !== null
    && !Array.isArray(section[1])
}
