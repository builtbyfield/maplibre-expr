import type { AnyInput, Expr, NumberInput, StringInput } from "./expr"

import { all, case_, eq, gt, gte, lt, neq } from "./operators/decision"
import { get, length } from "./operators/lookup"
import { abs, divide } from "./operators/math"
import { concat, isSupportedScript } from "./operators/string"
import { numberFormat, toString } from "./operators/types"
import { let_ } from "./operators/variables"

/** Options of {@link compactNumber}. */
export interface CompactNumberOptions {
  /**
   * BCP 47 language tag. Sets the abbreviations and where they start
   * (`"de"`: `"1,2 Mio."` and no abbreviation for thousands; `"en-IN"`:
   * `"12.3L"`; `"ja"`: `"123.5万"`), the digits and the separators.
   * Default `"en"`. Pass `navigator.language` for the user's language.
   */
  locale?: string
  /** ISO 4217 currency code, placed as the locale places it: `"$1.2M"`, `"1,2 Mio. €"`. */
  currency?: string
  /** ECMA-402 unit, e.g. `"kilometer"`, placed as the locale places it: `"1.2K km"`. */
  unit?: string
  /**
   * Fraction digits on abbreviated values. By default, like
   * `Intl.NumberFormat`'s compact notation: one below 10 (`"1.2K"`), none
   * from 10 (`"12K"`, `"123K"`).
   */
  maxFractionDigits?: number
  /** Numbers below this (in absolute value) aren't abbreviated. */
  minimum?: number
  /**
   * Your own divisors and suffixes instead of the locale's, ascending, e.g.
   * `[[1024, " KB"], [1024 ** 2, " MB"]]`. Can't be combined with
   * `currency` or `unit`.
   */
  scales?: readonly (readonly [divisor: number, suffix: string])[]
}

/** A range of numbers shown divided by `divisor`, with text around it (`[positive, negative]`). */
interface Scale {
  from: number
  divisor: number
  prefix: readonly [string, string]
  suffix: readonly [string, string]
}

const NUMBER_PARTS = new Set(["integer", "group", "decimal", "fraction"])

function affixes(parts: Intl.NumberFormatPart[]): [string, string] {
  const first = parts.findIndex(part => NUMBER_PARTS.has(part.type))
  const last = parts.length - 1 - [...parts].reverse().findIndex(part => NUMBER_PARTS.has(part.type))
  const text = (from: number, to: number): string => parts.slice(from, to).map(part => part.value).join("")
  return [text(0, first), text(last + 1, parts.length)]
}

/** Reads the locale's compact scales from `Intl`: where each starts, its divisor, and the text around the number. */
function localeScales(locale: string, currency: string | undefined, unit: string | undefined): Scale[] {
  const style: Intl.NumberFormatOptions = currency !== undefined ? { style: "currency", currency } : unit !== undefined ? { style: "unit", unit } : {}
  const format = new Intl.NumberFormat(locale, { notation: "compact", ...style })
  const scales: Scale[] = []
  let compact = false
  for (let power = 0; power <= 18; power++) {
    const positive = format.formatToParts(10 ** power)
    const negative = format.formatToParts(-(10 ** power))
    compact ||= positive.some(part => part.type === "compact")
    // 10^power shown with d integer digits means it was divided by 10^(power - d + 1); counting
    // digits works for every numbering system
    const digits = positive.filter(part => part.type === "integer").map(part => part.value).join("").length
    const [prefix, suffix] = affixes(positive)
    const [negativePrefix, negativeSuffix] = affixes(negative)
    const scale: Scale = { from: 10 ** power, divisor: 10 ** (power - digits + 1), prefix: [prefix, negativePrefix], suffix: [suffix, negativeSuffix] }
    const previous = scales.at(-1)
    if (previous === undefined || previous.divisor !== scale.divisor || String([previous.prefix, previous.suffix]) !== String([scale.prefix, scale.suffix]))
      scales.push(scale)
  }
  if (!compact)
    throw new Error(`compactNumber: this JavaScript runtime's Intl.NumberFormat has no compact notation for ${JSON.stringify(locale)}; pass \`scales\``)
  return scales
}

function customScales(locale: string, scales: NonNullable<CompactNumberOptions["scales"]>): Scale[] {
  const minus = new Intl.NumberFormat(locale).formatToParts(-1).find(part => part.type === "minusSign")?.value ?? "-"
  let previous = 1
  for (const [divisor] of scales) {
    if (!(divisor > previous))
      throw new RangeError(`compactNumber: scales must be ascending and above 1, got ${divisor} after ${previous}`)
    previous = divisor
  }
  return [
    { from: 0, divisor: 1, prefix: ["", minus], suffix: ["", ""] },
    ...scales.map(([divisor, suffix]): Scale => ({ from: divisor, divisor, prefix: ["", minus], suffix: [suffix, suffix] })),
  ]
}

/**
 * Formats a number compactly, e.g. `1234` becomes `"1.2K"`, for cluster
 * counts and other labels where space is tight. MapLibre's `number-format`
 * has no compact notation, so this reads the locale's abbreviations from
 * `Intl.NumberFormat` when it builds the expression, and the result matches
 * `Intl`'s compact notation (except that unabbreviated 4-digit numbers are
 * grouped: `"9,950"` where `Intl` writes `"9950"`).
 *
 * Throws if the JavaScript runtime's `Intl` lacks compact notation (pass
 * `scales` there), for an invalid locale, currency or unit, or for `scales`
 * together with `currency` or `unit`.
 *
 * @example "text-field": compactNumber(get("point_count")) // 1234 → "1.2K", 56789 → "57K"
 * @example compactNumber(get("population"), { locale: "de" }) // 1234567 → "1,2 Mio."
 * @example compactNumber(get("sales"), { locale: "en-IN", currency: "INR" }) // 1234567 → "₹12L"
 * @example compactNumber(get("size"), { scales: [[1024, " KB"], [1024 ** 2, " MB"]], maxFractionDigits: 1 })
 */
export function compactNumber(input: NumberInput, options: CompactNumberOptions = {}): Expr<string> {
  const { locale = "en", currency, unit, maxFractionDigits, minimum, scales: custom } = options
  if (custom !== undefined && (currency !== undefined || unit !== undefined))
    throw new RangeError("compactNumber: `scales` can't be combined with `currency` or `unit`")
  const scales = custom !== undefined ? customScales(locale, custom) : localeScales(locale, currency, unit)

  // Fraction digits near the top of scale i, where values reach `top`
  const digitsBelow = (i: number, top: number): number =>
    maxFractionDigits === undefined ? (top <= 10 ? 1 : 0) : i === 0 ? 0 : maxFractionDigits
  // Scale i takes over where the previous one would round up to it, e.g. from 999.5
  // (which shows as "1K", not "1,000"); and not before `minimum`.
  const starts = scales.map((scale, i) => {
    if (i === 0)
      return 0
    const below = scales[i - 1]!
    const top = scale.from / below.divisor
    return Math.max(scale.from - 0.5 * below.divisor / 10 ** digitsBelow(i - 1, top), minimum ?? 0)
  })

  return let_({ n: input }, ({ n }) => let_({ a: abs(n) }, ({ a }) => {
    const show = (scale: Scale, i: number): Expr<string> => {
      const value = scale.divisor === 1 ? a : divide(a, scale.divisor)
      const digits = maxFractionDigits !== undefined && i > 0 ? maxFractionDigits : maxFractionDigits !== undefined ? 0 : case_([[lt(value, 10), 1]], 0)
      const affix = ([positive, negative]: readonly [string, string]): StringInput =>
        positive === negative ? positive : case_([[lt(n, 0), negative]], positive)
      const number = numberFormat(value, { "locale": locale, "max-fraction-digits": digits })
      const parts = [affix(scale.prefix), number, affix(scale.suffix)].filter(part => part !== "")
      // There's always a sign or affix around the number, so there are at least two parts
      return concat(...parts as [StringInput, StringInput])
    }
    const used = scales.map((scale, i) => ({ scale, i, start: starts[i]! })).filter(({ i, start }) => i === 0 || start < (starts[i + 1] ?? Infinity))
    const [first, ...rest] = used
    if (rest.length === 0)
      return show(first!.scale, 0)
    const branches = rest.reverse().map(({ scale, i, start }) => [gte(a, start), show(scale, i)] as const)
    return case_(branches as [readonly [Expr<boolean>, Expr<string>], ...(readonly [Expr<boolean>, Expr<string>])[]], show(first!.scale, 0))
  }))
}

/**
 * The first of `values` that isn't missing or empty, as a string; `""` if
 * there's none. Unlike `coalesce`, which only skips `null`, this also skips
 * `""`, which many datasets use for "no value". Each value is converted
 * with `to-string`, so `12` becomes `"12"` and `false` becomes `"false"`.
 *
 * @example firstNonEmpty(get("name:en"), get("name"), "Unnamed")
 */
export function firstNonEmpty(...values: [AnyInput, ...AnyInput[]]): Expr<string> {
  // A `case` per value, not a `let`: MapLibre's parser takes time exponential in the depth of nested `let`s
  return values.reduceRight<Expr<string> | string>((rest, value) => {
    const text = toString(value)
    return case_([[gt(length(text), 0), text]], rest)
  }, "") as Expr<string>
}

/** Options of {@link localizedName}. */
export interface LocalizedNameOptions {
  /**
   * The property holding a language's name, with `{lang}` where the language
   * goes. Default `"name:{lang}"` (OpenMapTiles, Protomaps, MapTiler); use
   * `"name_{lang}"` for Shortbread/VersaTiles tiles.
   */
  field?: string
  /** Properties to try after the languages. Default `["name"]`. */
  fallback?: readonly string[]
  /**
   * Properties for a second line, e.g. `"name"` for the local name under a
   * translated one (`"Munich"` / `"München"`), or `"name:nonlatin"` with
   * OpenMapTiles. The first non-empty one is shown when it differs from the
   * first line and `is-supported-script` accepts it. maplibre-gl before 6.9
   * rejects right-to-left text without the RTL text plugin and scripts that
   * need complex shaping (e.g. Devanagari), which it would draw wrongly;
   * 6.9 and later accept everything.
   */
  secondLine?: string | readonly string[]
}

/**
 * A feature's name in the first of `languages` it has, falling back to
 * `name`. Missing *and empty* names are skipped. A language can be an
 * expression, e.g. `globalState("lang")`, so one style can switch language
 * at runtime: set it with `syncGlobalState(map, "lang", "fr")`. Changing it
 * reloads the tiles of the layers that use it.
 *
 * Throws if `field` has no `{lang}`.
 *
 * @example "text-field": localizedName(["fr", "en"]) // name:fr, else name:en, else name
 * @example "text-field": localizedName([globalState("lang"), "en"], { secondLine: "name" }) // "Munich\nMünchen"
 * @example "text-field": localizedName(["de"], { field: "name_{lang}" })
 */
export function localizedName(languages: readonly StringInput[], options: LocalizedNameOptions = {}): Expr<string> {
  const { field = "name:{lang}", fallback = ["name"], secondLine } = options
  const [before, after, ...extra] = field.split("{lang}")
  if (after === undefined || extra.length > 0)
    throw new RangeError(`localizedName: field must contain "{lang}" once, got ${JSON.stringify(field)}`)
  const property = (language: StringInput): Expr<unknown> => {
    if (typeof language === "string")
      return get(`${before}${language}${after}`)
    const parts = [before!, language, after].filter(part => part !== "")
    return get(parts.length === 1 ? language : concat(...parts as [StringInput, StringInput]))
  }
  const first = firstNonEmpty(...[...languages.map(property), ...fallback.map(name => get(name))] as [AnyInput, ...AnyInput[]])
  if (secondLine === undefined)
    return first
  const second = typeof secondLine === "string" ? [secondLine] : secondLine
  if (second.length === 0)
    throw new RangeError("localizedName: secondLine must name at least one property")
  return let_({ line1: first, line2: firstNonEmpty(...second.map(name => get(name)) as [AnyInput, ...AnyInput[]]) }, ({ line1, line2 }) => case_([
    [eq(length(line1), 0), line2],
    [all(gt(length(line2), 0), neq(line2, line1), isSupportedScript(line2)), concat(line1, "\n", line2)],
  ], line1))
}
