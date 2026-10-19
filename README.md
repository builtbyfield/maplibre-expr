# @builtbyfield/maplibre-expr

[![npm](https://img.shields.io/npm/v/@builtbyfield/maplibre-expr)](https://www.npmjs.com/package/@builtbyfield/maplibre-expr) [![CI](https://github.com/builtbyfield/maplibre-expr/actions/workflows/ci.yml/badge.svg)](https://github.com/builtbyfield/maplibre-expr/actions/workflows/ci.yml) [![coverage](https://codecov.io/gh/builtbyfield/maplibre-expr/graph/badge.svg)](https://codecov.io/gh/builtbyfield/maplibre-expr) [![bundle size](https://deno.bundlejs.com/badge?q=@builtbyfield/maplibre-expr)](https://bundlejs.com/?q=@builtbyfield/maplibre-expr) [![style spec](https://img.shields.io/badge/style%20spec-v26-blue)](https://github.com/builtbyfield/maplibre-expr/actions/workflows/spec-drift.yml) [![license](https://img.shields.io/npm/l/@builtbyfield/maplibre-expr)](LICENSE)

Type-safe [MapLibre style expressions](https://maplibre.org/maplibre-style-spec/expressions/) for TypeScript. A broken expression doesn't throw: features quietly disappear, or a paint property falls back to its default. With this package, typos and type mismatches fail to compile, and a test harness runs your expressions on MapLibre's own engine. The output is plain style JSON.

**[Live demo](https://builtbyfield.github.io/maplibre-expr/)** | **[Open in StackBlitz](https://stackblitz.com/github/builtbyfield/maplibre-expr/tree/main/examples/starter)** | [Example source](examples/starter)

```ts
import { isOneOf, typedProperties } from "@builtbyfield/maplibre-expr"
import { evaluate } from "@builtbyfield/maplibre-expr/testing"

const road = typedProperties<{ class: "motorway" | "trunk" | "primary" | "minor" }>()

const isMajor = isOneOf(road.get("class"), ["motorway", "trunk", "primary"])
// ["match", ["get", "class"], ["motorway", "trunk", "primary"], true, false]

isOneOf(road.get("class"), ["motorway", "primray"])
//                                      ~~~~~~~~~ Type '"primray"' is not assignable to type '"minor" | "motorway" | "primary" | "trunk"'. Did you mean '"primary"'?

evaluate(isMajor, { properties: { class: "minor" } }) // false
```

MapLibre's own `ExpressionSpecification` type accepts `["+", ["upcase", "x"], 1]`, so raw arrays get no help from the compiler. This package attacks that from two sides:

- **Types.** Every builder records what its expression evaluates to (`Expr<number>`, `Expr<string>`, `Expr<Color>`, and so on), so wrong compositions are compile errors. With [typed feature data](#typed-feature-data), so are misspelled property names and values.
- **Tests.** `@builtbyfield/maplibre-expr/testing` evaluates expressions with MapLibre's real engine and throws where the renderer would fail silently, so you can unit-test a filter against sample features, [check that a rewrite behaves the same](#checking-a-rewrite), and [lint a whole style](#linting-a-whole-style).

Also:

- **All 88 operators** of the style spec (v26), each with JSDoc, a link to its spec entry, and platform notes where a renderer lacks it.
- **Zero-cost output.** Builders return the same arrays you'd write by hand. They drop straight into layer `paint`/`layout`/`filter` and `map.setPaintProperty`, no casts, and mix freely with existing hand-written expressions. Importing one function adds about 170 bytes.
- **A few recipes** for jobs that are fiddly to get right by hand: zoom ramps, meters-to-pixels radii, compact number labels, hover states, global state.
- **The [gotchas](#gotchas), written down:** MapLibre behaviors that surprise people, with builders that throw for the ones they can detect.

## Example

[![A globe of the Pacific dotted with a month of earthquakes, with a time slider and a depth legend](https://builtbyfield.github.io/maplibre-expr/og.png)](https://builtbyfield.github.io/maplibre-expr/)

A small, complete app: a typed basemap on OpenFreeMap tiles and a month of real earthquakes with a time slider, plus tests that check every expression with MapLibre's engine. [Try the live demo](https://builtbyfield.github.io/maplibre-expr/), or [open it in StackBlitz](https://stackblitz.com/github/builtbyfield/maplibre-expr/tree/main/examples/starter) and misspell a road class to see the compile error, or break the time filter and run `npm test`. To start a project from it: `npx degit builtbyfield/maplibre-expr/examples/starter my-map`.

## Install

```sh
npm install @builtbyfield/maplibre-expr
```

No runtime dependencies, and it works with any maplibre-gl version, since the builders just emit style-spec JSON. TypeScript 5.4+ if you use TypeScript. Ships ESM and CommonJS builds, so it also works in Jest without extra configuration.

## Usage

```ts
import type { LayerSpecification } from "maplibre-gl"
import { byZoom, case_, eq, featureState, get, gt, isOneOf, match, numberFormat } from "@builtbyfield/maplibre-expr"

const layers: LayerSpecification[] = [
  {
    id: "parks",
    type: "fill",
    source: "landuse",
    filter: isOneOf(get("class"), ["park", "garden"]),
    paint: {
      "fill-color": case_([
        [eq(featureState("hover"), true), "#2a9d8f"],
        [gt(get("area"), 10_000), "#52b788"],
      ], "#95d5b2"),
      "fill-opacity": byZoom([[8, 0.2], [14, 0.8]]),
    },
  },
  {
    id: "labels",
    type: "symbol",
    source: "places",
    layout: {
      "text-field": match(get("kind"), [
        ["shop", get("name")],
        [["cafe", "bar"], numberFormat(get("rating"), { "max-fraction-digits": 1 })],
      ], ""),
    },
  },
]
```

Function names follow the spec: kebab-case becomes camelCase (`index-of` becomes `indexOf`), symbolic operators get names (`==` is `eq`, `+` is `add`), and reserved words get a trailing underscore (`case_`, `in_`, `let_`, `var_`, `typeof_`). See the [operator table](#operators).

With react-map-gl, builders go straight into `<Layer>` props (checked with react-map-gl 8):

```tsx
<Layer
  id="parks"
  type="fill"
  source="landuse"
  filter={isOneOf(get("class"), ["park", "garden"])}
  paint={{ "fill-opacity": byZoom([[8, 0.2], [14, 0.8]]) }}
/>
```

## Testing expressions

`@builtbyfield/maplibre-expr/testing` evaluates expressions with MapLibre's own engine. Unlike MapLibre at render time, it throws instead of silently falling back to a default:

```ts
import { compactNumber, get, interpolate, linear, zoom } from "@builtbyfield/maplibre-expr"
import { evaluate, validate } from "@builtbyfield/maplibre-expr/testing"

evaluate(compactNumber(get("count")), { properties: { count: 5_600_000 } }) // "5.6M"
evaluate(interpolate(linear(), zoom(), [[0, "#000"], [10, "#fff"]]), { zoom: 5 }) // "rgba(128,128,128,1)"
evaluate(["number", ["get", "missing"]]) // throws ExpressionError: Expected value to be of type number, but found null instead.

validate(["+", 1, ["upcase", "x"]]) // { valid: false, errors: ["[2]: Expected number but found string instead."] }
validate(get("weight"), { property: "heatmap-intensity" }) // { valid: false, errors: ["heatmap-intensity: data expressions not supported"] }
```

### Checking a rewrite

When refactoring or migrating a style, the JSON can change while the behavior should stay the same. `assertEquivalent` evaluates two expressions on hundreds of generated cases and throws with a counterexample if they ever differ:

```ts
import { assertEquivalent } from "@builtbyfield/maplibre-expr/testing"

assertEquivalent(legacyFilter, rewrittenFilter)
// Error: Expressions differ after 12 case(s).
//   case:   {"properties":{"n":5},...}
//   first:  false
//   second: true
```

Cases are generated from the expressions themselves: every property and state they read is set to a literal it's compared against, matched to or used as a stop for, a number just either side of one, another literal from the expressions, a generic edge value (`-1`, `0.5`, `1234.5`, `""`, booleans), or left missing. That's what catches boundary bugs like `gt` versus `gte`. A failing case is shrunk to the properties and state that make the difference, so it's short enough to read. Use `checkEquivalent` for the result instead of a throw, and `samples`, `seed`, `values`, `zooms` and `geometries` to tune the cases.

### Validating against a property

Pass `property` (any layer property name, or `"filter"`) to check an expression where it will be used. That runs MapLibre's own style validator, which also catches data expressions in properties that don't support them, `zoom` outside a top-level ramp, and `feature-state` in filters and layout properties. For a filter it also checks that the result is a boolean: the validator misses that, but maplibre-gl throws when it creates the layer.

`/testing` bundles its own copy of MapLibre's expression engine (style-spec v26), so it never conflicts with the style-spec or maplibre-gl version your app uses. The flip side: it evaluates with v26 semantics. If your map runs an older maplibre-gl, check the [platform notes](#platform-support) for operators it may not have.

`evaluate` accepts the feature and map state an expression can read: `properties`, `id`, `geometry` (GeoJSON, used by `geometry-type`, `within` and `distance`), `zoom`, `featureState`, `globalState`, `heatmapDensity`, `lineProgress`, `elevation`, `accumulated`, `availableImages`, and the expected `type`.

`evaluate` and `validate` accept plain values as well as expressions, so helpers typed to return `BooleanInput` or `NumberInput` can be tested directly.

### Linting a whole style

`lintStyle` checks a complete style, such as a `style.json` you already have, so you can start using it before you write a single builder:

```ts
import { lintStyle } from "@builtbyfield/maplibre-expr/testing"

expect(lintStyle(style)).toEqual([])
// or, when something's wrong:
// [{ rule: "constant-comparison", layer: "parks", property: "fill-color", message: '[1]: ["==","class","park"] compares two literals, so it's constant. ...' }]
```

It runs MapLibre's style validator over the whole style (the `"spec"` rule; maplibre-gl runs the same one when it loads a style), and reports each problem by layer id and property. It also runs three checks the validator doesn't:

- `"filter-type"`: an expression filter that isn't a boolean. maplibre-gl throws when it creates the layer.
- `"constant-comparison"`: `["==", "class", "park"]` in a paint or layout property compares two strings, so it's always `false`. In a filter it's valid legacy syntax, and the validator already catches it mixed into an expression filter. The comparison builders refuse to build it.
- `"transparent-fade"`: a ramp from `"#fff"` to `"transparent"` is grey halfway, because `"transparent"` is transparent _black_ and MapLibre blends the color channels too. It suggests the same color at alpha 0. Transparent stops with a color, like a heatmap starting at `rgba(33,102,172,0)`, blend hues on purpose and aren't reported.

## For AI coding agents

A broken expression produces no error at render time, only missing features, so an agent can't see its own mistakes by looking at the map. Paste this into your project's `AGENTS.md` or `CLAUDE.md`:

```md
## MapLibre expressions

- Build style expressions with `@builtbyfield/maplibre-expr`, not raw arrays, and run the type checker.
- Declare the properties of each source layer once with `typedProperties<...>()` and read them through it.
- For every filter and data-driven property, write a test that calls `evaluate()` from `@builtbyfield/maplibre-expr/testing` on sample features, including ones that should be excluded and ones with missing properties.
- Check each expression where it's used with `validate(expr, { property })`.
- Break an expression on purpose (e.g. `gt` to `gte`) and confirm a test fails.
- When rewriting an existing expression, show the behavior is unchanged with `assertEquivalent(before, after)`.
- Test the finished style with `expect(lintStyle(style)).toEqual([])`.
```

## What the types check

- **Argument types.** A string expression isn't accepted where a number is required, a color isn't accepted where a string is, and so on.
- **Comparison operands.** `eq(add(1, 2), "x")` is an error, and `eq(geometryType(), "Polgon")` catches the typo.
- **Branch outputs.** `case_`, `match`, `step` and `coalesce` take their output type from their first branch, as MapLibre does, so `case_([[cond, 1]], "x")` is an error.
- **Typed variables.** `let_` passes typed references to its body:
  ```ts
  let_({ density: divide(get("pop"), get("area")) }, ({ density }) =>
    interpolate(linear(), density, [[0, "#fff"], [1000, "#f00"]]))
  ```
- **Arity and structure.** For example, `add` needs at least two inputs and ramps need at least one stop.
- **Forgotten `literal`.** A bare data array like `["a", "b"]` can't be passed as an expression; wrap it in `literal()`.
- **Typed `typeof_` results.** `eq(typeof_(get("x")), "nubmer")` is an error.

### Typed feature data

Declare the shape of your features (and of feature state and global state) to have property names and values checked:

```ts
interface Place { name: string, rank: number, kind: "park" | "lake" }
const place = typedProperties<Place>()
const app = typedGlobalState<{ now: number }>()

gt(place.get("rank"), 3) // ["get", "rank"], typed as a number
eq(place.get("kind"), "lak") // compile error: not "park" | "lake"
place.get("rnak") // compile error: no such property
place.getOr("rank", 0) // the property, or 0 if missing or not a number
gt(get("ends_at"), app.get("nwo")) // compile error
```

The accessors emit the same `["get", ...]`, `["has", ...]`, `["feature-state", ...]` and `["global-state", ...]` arrays as the untyped functions. Values are typed as the property's type _when present_: `null` and `undefined` in the declared type are dropped, so a schema type where every field is nullable (e.g. inferred from zod) works as is. A missing property is still `null` at runtime; use `getOr` or `coalesce` for that.

Some mistakes are caught when the expression is built:

- `interpolate` and `step` throw if stops aren't in ascending order.
- `let_` and `isOneOf` throw when given nothing to work with.

### What they don't check

- **Untyped feature data.** Plain `get`, `featureState`, `globalState` and `var_` accept any name and produce values accepted anywhere; MapLibre checks them at runtime. Use [typed feature data](#typed-feature-data), or pin one value's type with `get<number>("population")`.
- **Raw arrays are an escape hatch.** You can pass `["get", "x"]` or any existing `ExpressionSpecification` value. Only the operator name is checked, not the arguments.
- **Where an expression is allowed.** For example, `zoom()` must be the input of a top-level `interpolate`/`step`, and `featureState` isn't allowed in filters or layout properties. [`validate(expr, { property })`](#validating-against-a-property) catches these.
- **Whether an expression fits its property.** Layer properties accept any `Expr`, so `"fill-opacity": upcase("x")`, `"fill-color": gt(get("n"), 1)` and `filter: add(1, 2)` compile (see the note on `Expr` below). [`validate(expr, { property })`](#validating-against-a-property) catches these too.

The `Expr` type is deliberately opaque: statically it presents as a single member of the spec union, which keeps type-checking fast. Use `toSpec(expr)` if you need to inspect the array.

## Platform support

The builders emit standard style-spec JSON, so they work wherever MapLibre styles do. A few operators need a recent renderer:

- **MapLibre GL JS:**
  - `semiliteral` needs 6.6+;
  - `split`, `join` and the `unit` option of `numberFormat` need 5.20+;
  - `globalState` and `elevation` need 5.6+;
  - `distance` needs 4.2+.
- **MapLibre Native (iOS/Android):** the style spec lists `featureState`, `globalState`, `semiliteral`, `interpolateHcl`, `interpolateLab` and `numberFormat`'s `unit` option as not yet supported. That includes the `ifFeatureState` recipe. Several of the linked tracking issues are closed, so check your Native version.

Each of these functions' docs carries the same note, with a link to the tracking issue.

## Gotchas

MapLibre behaviors that surprise people. The builders throw for the ones they can detect; the rest are noted in the docs of the functions involved.

- **Missing properties break math.** `get` returns `null` for a missing property, most operators fail on `null`, and MapLibre then silently uses the property's default. Use `getOr("height", 0)` or `coalesce`.
- **No type coercion.** A property holding `"1"` doesn't equal or match `1`, and `lt(get("n"), 5)` fails at runtime if `n` is a string; vector tiles often store numbers as strings. Convert with `toNumber`.
- **Comparing two literals in a filter.** `eq("class", "park")` reads as old-style filter syntax (property `class` is `"park"`) in a filter, and as a constant `false` anywhere else. The comparison builders throw for it; write `eq(get("class"), "park")`.
- **Fading to `"transparent"` darkens.** Colors blend without premultiplied alpha, so "transparent" (transparent black) drags colors toward black. Fade to the same color at alpha 0; [`lintStyle`](#linting-a-whole-style) flags this.
- **Odd conversions.** `toNumber("")` is `0`, `toBoolean("false")` is `true`, and `sqrt(-1)` and `0 / 0` give `NaN`, which MapLibre replaces with the property's default.
- **Icons missing from the sprite.** `"icon-image": get("subclass")` shows nothing when the sprite has no image of that name. `coalesce(image(get("subclass")), image(get("class")))` falls back to the next image that exists (if none does, it returns the first name, so `styleimagemissing` still fires for it). That beats keeping a list of the names your sprite has, which goes stale.
- **Numbers in text.** `concat(toString(get("height")), " m")` shows float noise (`"7.000000000000001 m"`) and `" m"` when the value is missing. `numberFormat(get("height"), { "unit": "meter", "max-fraction-digits": 1 })` gives `"7 m"`, and no label when the value is missing.
- **Names aren't paths.** `get("a.b")` reads a property literally named `"a.b"`; use `get("b", object(get("a")))`.
- **Colors.** `oklch()`, `lab()` and `color()` aren't supported; hex, `rgb()`, `hsl()` and named colors are.
- **Upstream bugs this library works around or documents:**
  - `number-format` ignores a fraction-digit setting of `0`; `numberFormat` works around it.
  - `distance` measures MultiLineString features as one connected line.
  - `toColor` reads `[r, g, b, a]` arrays as premultiplied.

## Recipes

Each recipe handles something that's easy to get wrong by hand. The JSDoc of each one says what.

| Recipe                                              | What it does                                                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `byZoom(stops, curve?)`                             | A value that changes with zoom: `exponential(1.5)` for sizes, `linear()` for colors.                                                                                 |
| `byZoomMatch(input, branches, fallback, curve?)`    | A different zoom ramp per category, e.g. road width by class. The obvious `match` of zoom ramps is rejected by MapLibre.                                             |
| `metersToPixels(meters, latitude)`                  | A size in pixels that stays a fixed real-world distance at every zoom, e.g. a 500 m `circle-radius`.                                                                 |
| `classify(input, breaks, outputs, noData)`          | Choropleth classes. Missing and non-numeric values get `noData` instead of the property's default.                                                                   |
| `ifFeatureState(state, whenTrue, whenFalse)`        | Hover/selected styling via feature state; an unset state counts as false. Takes a priority list too.                                                                 |
| `getOr(property, fallback)`                         | A property, or the fallback if it's missing _or has the wrong type_.                                                                                                 |
| `isOneOf(input, values)`, `isNoneOf(input, values)` | Membership tests that compile to a fast `match`; no `literal` to forget.                                                                                             |
| `localizedName(languages, options?)`                | The name in the first available language, optionally with the local name on a second line.                                                                           |
| `firstNonEmpty(...values)`                          | Like `coalesce`, but also skips `""`.                                                                                                                                |
| `compactNumber(input, options?)`                    | `1234` becomes `"1.2K"`, in any locale: `"1,2 Mio."`, `"12L"`, `"123万"`, with currencies and units.                                                                 |
| `contrastText(background, options?)`                | Black or white text, whichever reads better on a data-driven background (WCAG 2).                                                                                    |
| `colorOr(value, fallback, options?)`                | A color from feature data, with a fallback for missing, empty and invalid values (`coalesce` only covers missing ones). Reads GTFS-style hex without `#` on request. |
| `withAlpha(color, alpha)`                           | The same color with a different opacity.                                                                                                                             |

### Labels in the reader's language

`localizedName` tries each language in order and falls back to `name`, skipping missing and empty names (`coalesce` stops at `""`). A language can come from global state, so one style can switch language at runtime:

```ts
const layout = {
  "text-field": localizedName([globalState("lang"), "en"], { secondLine: "name" }), // "Munich\nMünchen"
}

// keep "lang" set on the map
const stop = syncGlobalState(map, "lang", navigator.language.slice(0, 2))
```

The second line shows the local name only when it's there and differs from the first line. maplibre-gl 5 and earlier also leave it out for scripts they'd draw wrongly (right-to-left text without the RTL plugin, and scripts like Devanagari). Field names default to `name:fr` (OpenMapTiles, Protomaps, MapTiler); pass `field: "name_{lang}"` for Shortbread. Changing the language reloads the tiles of the layers that use it.

### Compact numbers in any locale

MapLibre's `number-format` has no compact notation. `compactNumber` reads the locale's abbreviations from `Intl.NumberFormat` when it builds the expression, and its output matches `Intl` (the tests check this in 12 locales):

```ts
compactNumber(get("point_count")) // 1234 → "1.2K", 56789 → "57K"; point_count_abbreviated is English only
compactNumber(get("population"), { locale: "de" }) // 1234567 → "1,2 Mio." (thousands aren't abbreviated in German)
compactNumber(get("sales"), { locale: "en-IN", currency: "INR" }) // 1234567 → "₹12L"
compactNumber(get("count"), { minimum: 10_000 }) // 9876 → "9,876"
compactNumber(get("bytes"), { scales: [[1024, " KB"], [1024 ** 2, " MB"]] }) // your own units
```

## Global state

Expressions can't read the clock or your app's state, and baking a value like `Date.now()` into a style freezes it, so every change means rebuilding the filter and calling `setFilter` on each layer. Instead, read the value with `globalState(name)` and set it on the map. The filter then never changes identity:

```ts
// layer filter: events that haven't ended
filter: gt(get("ends_at"), globalState("now"))

// keep "now" set on the map
const stop = syncGlobalState(map, "now", Date.now())
```

Setting it by hand with `map.setGlobalStateProperty` has three pitfalls, which `syncGlobalState` handles:

- **It throws before the style loads** ("Style is not done loading"), e.g. in a React effect on first mount. `syncGlobalState` applies it on the first `styledata` event instead.
- **A full style reload clears global state.** `setStyle(..., { diff: true })` keeps it; a reload without `diff` starts empty. `syncGlobalState` re-applies after every `styledata`.
- **Re-applying fights manual changes.** Because it keeps the value set, a value changed by hand (e.g. from devtools) is put back on the next `styledata`. Stop the sync first.

To change the value, stop and sync again. In React: `useEffect(() => syncGlobalState(map, "now", now), [map, now])`.

The same goes for selections and sliders: instead of rebuilding a filter on every click or slider input, compare against global state, e.g. `eq(get("route_id"), globalState("route"))` or `in_(get("id"), globalState("selected"))` with an array. An unset value makes `eq` and `in_` false, but makes number comparisons like `lte(get("start"), globalState("time"))` fail, which hides every feature until the value is set; `syncGlobalState` sets it as soon as the style loads.

Global state doesn't make re-filtering free: when the value changes, MapLibre still re-evaluates the layers that read it. What you save is rebuilding and re-applying filters. Global state needs maplibre-gl 5.6+ (see [platform support](#platform-support)).

## Writing your own helpers

Accept `*Input` types and return `Expr<T>`. Inputs then take literals and expressions alike, and results compose with every builder:

```ts
import type { Expr, NumberInput, Stops } from "@builtbyfield/maplibre-expr"

function isOpenAt(time: NumberInput): Expr<boolean> {
  return all(lte(get("opens"), time), gt(get("closes"), time))
}

// For ramps, use `Stops<T>`: a non-empty list of [input, output] pairs
function widthRamp(stops: Stops<NumberInput>): Expr<number> {
  return byZoom(stops, linear())
}
```

`Input<T>` (`T` or an expression producing `T`) has shorthands: `NumberInput`, `StringInput`, `BooleanInput`, `ColorInput`, `ArrayInput<T>`.

## Operators

| Spec group            | Operators (function name in parentheses where it differs)                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variable binding      | `let` (`let_`), `var` (`var_`)                                                                                                                                                                                                                                            |
| Types                 | `literal`, `semiliteral`, `array`, `typeof` (`typeof_`), `string`, `number`, `boolean`, `object`, `collator`, `format`, `image`, `number-format` (`numberFormat`), `to-string` (`toString`), `to-number` (`toNumber`), `to-boolean` (`toBoolean`), `to-color` (`toColor`) |
| Lookup                | `at`, `in` (`in_`), `index-of` (`indexOf`), `slice`, `global-state` (`globalState`), `get`, `has`, `length`                                                                                                                                                               |
| Decision              | `case` (`case_`), `match`, `coalesce`, `==` (`eq`), `!=` (`neq`), `>` (`gt`), `<` (`lt`), `>=` (`gte`), `<=` (`lte`), `all`, `any`, `!` (`not`), `within`                                                                                                                 |
| Ramps, scales, curves | `step`, `interpolate`, `interpolate-hcl` (`interpolateHcl`), `interpolate-lab` (`interpolateLab`) (curves: `linear()`, `exponential(base)`, `cubicBezier(x1, y1, x2, y2)`)                                                                                                |
| Math                  | `ln2`, `pi`, `e`, `+` (`add`), `*` (`multiply`), `-` (`subtract`), `/` (`divide`), `%` (`mod`), `^` (`pow`), `sqrt`, `log10`, `ln`, `log2`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `min`, `max`, `round`, `abs`, `ceil`, `floor`, `distance`                        |
| Color                 | `to-rgba` (`toRgba`), `rgb`, `rgba`                                                                                                                                                                                                                                       |
| Feature data          | `properties`, `feature-state` (`featureState`), `geometry-type` (`geometryType`), `id`, `line-progress` (`lineProgress`), `accumulated`                                                                                                                                   |
| Zoom                  | `zoom`                                                                                                                                                                                                                                                                    |
| Heatmap               | `heatmap-density` (`heatmapDensity`)                                                                                                                                                                                                                                      |
| Color Relief          | `elevation`                                                                                                                                                                                                                                                               |
| String                | `is-supported-script` (`isSupportedScript`), `upcase`, `downcase`, `concat`, `resolved-locale` (`resolvedLocale`), `split`, `join`                                                                                                                                        |

## Compared to other tools

The other tools we know of are small languages that compile to expressions, like [Expressive](https://github.com/falseinput/expressive) and Mapbox's [expression-jamsession](https://github.com/mapbox/expression-jamsession). This package is plain TypeScript instead: there's no new syntax to learn, autocomplete and the type checker work as usual, builders mix with hand-written arrays, and the output is the same style JSON you'd write by hand.

## Contributing

Every operator is tested by evaluating it with MapLibre's engine, not by comparing array shapes. A test fails if the style spec gains an operator without a wrapper, and a weekly CI job runs the suite against the latest spec. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the code layout, the type design rules and how releases work.

## About

Built and maintained by [Built by Field](https://www.builtbyfield.com), a design and technology studio. We use it in the map-heavy apps we build, and fix what we find along the way. Need help with a MapLibre project? [Get in touch](https://www.builtbyfield.com/contact).

## License

MIT
