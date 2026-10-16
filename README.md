# @builtbyfield/maplibre-expr

[![npm](https://img.shields.io/npm/v/@builtbyfield/maplibre-expr)](https://www.npmjs.com/package/@builtbyfield/maplibre-expr) [![CI](https://github.com/builtbyfield/maplibre-expr/actions/workflows/ci.yml/badge.svg)](https://github.com/builtbyfield/maplibre-expr/actions/workflows/ci.yml)

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
- **Tests.** `@builtbyfield/maplibre-expr/testing` evaluates expressions with MapLibre's real engine and throws where the renderer would fail silently, so you can unit-test a filter against sample features, and [check that a rewrite behaves the same](#checking-a-rewrite).

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

Pass `property` (any layer property name, or `"filter"`) to check an expression where it will be used. That runs MapLibre's own style validator, which also catches data expressions in properties that don't support them, `zoom` outside a top-level ramp, and `feature-state` in filters and layout properties.

`/testing` bundles its own copy of MapLibre's expression engine (style-spec v26), so it never conflicts with the style-spec or maplibre-gl version your app uses. The flip side: it evaluates with v26 semantics. If your map runs an older maplibre-gl, check the [platform notes](#platform-support) for operators it may not have.

`evaluate` accepts the feature and map state an expression can read: `properties`, `id`, `geometry` (GeoJSON, used by `geometry-type`, `within` and `distance`), `zoom`, `featureState`, `globalState`, `heatmapDensity`, `lineProgress`, `elevation`, `accumulated`, `availableImages`, and the expected `type`.

`evaluate` and `validate` accept plain values as well as expressions, so helpers typed to return `BooleanInput` or `NumberInput` can be tested directly.

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
- `let_`, `isOneOf` and `matchRecord` throw when given nothing to work with.

### What they don't check

- **Untyped feature data.** Plain `get`, `featureState`, `globalState` and `var_` accept any name and produce values accepted anywhere; MapLibre checks them at runtime. Use [typed feature data](#typed-feature-data), or pin one value's type with `get<number>("population")`.
- **Raw arrays are an escape hatch.** You can pass `["get", "x"]` or any existing `ExpressionSpecification` value. Only the operator name is checked, not the arguments.
- **Where an expression is allowed.** For example, `zoom()` must be the input of a top-level `interpolate`/`step`, and `featureState` isn't allowed in filters or layout properties. `validate(expr, { property })` (below) catches these.

The `Expr` type is deliberately opaque: statically it presents as a single member of the spec union, which keeps type-checking fast. Use `toSpec(expr)` if you need to inspect the array.

## Platform support

The builders emit standard style-spec JSON, so they work wherever MapLibre styles do. A few operators need a recent renderer:

- **MapLibre GL JS:**
  - `semiliteral` needs 6.6+;
  - `split`, `join` and the `unit` option of `numberFormat` need 5.20+;
  - `globalState` and `elevation` need 5.6+;
  - `distance` needs 4.2+.
- **MapLibre Native (iOS/Android):** the style spec lists `featureState`, `globalState`, `semiliteral`, `interpolateHcl`, `interpolateLab` and `numberFormat`'s `unit` option as not yet supported. That includes the `ifFeatureState` recipe and `mixColors` in HCL/Lab. Several of the linked tracking issues are closed, so check your Native version.

Each of these functions' docs carries the same note, with a link to the tracking issue.

## Gotchas

MapLibre behaviors that surprise people. The builders throw for the ones they can detect; the rest are noted in the docs of the functions involved.

- **Missing properties break math.** `get` returns `null` for a missing property, most operators fail on `null`, and MapLibre then silently uses the property's default. Use `getOr("height", 0)` or `coalesce`.
- **No type coercion.** A property holding `"1"` doesn't equal or match `1`, and `lt(get("n"), 5)` fails at runtime if `n` is a string; vector tiles often store numbers as strings. Convert with `toNumber`.
- **Comparing two literals in a filter.** `eq("class", "park")` reads as old-style filter syntax (property `class` is `"park"`) in a filter, and as a constant `false` anywhere else. The comparison builders throw for it; write `eq(get("class"), "park")`.
- **Fading to `"transparent"` darkens.** Colors blend without premultiplied alpha, so "transparent" (transparent black) drags colors toward black. Fade to the same color at alpha 0.
- **Odd conversions.** `toNumber("")` is `0`, `toBoolean("false")` is `true`, and `sqrt(-1)` and `0 / 0` give `NaN`, which MapLibre replaces with the property's default.
- **Names aren't paths.** `get("a.b")` reads a property literally named `"a.b"`; use `get("b", object(get("a")))`.
- **Colors.** `oklch()`, `lab()` and `color()` aren't supported; hex, `rgb()`, `hsl()` and named colors are.
- **Upstream bugs this library works around or documents:**
  - `number-format` ignores a fraction-digit setting of `0`; `numberFormat` works around it.
  - `distance` measures MultiLineString features as one connected line.
  - `toColor` reads `[r, g, b, a]` arrays as premultiplied.

## Recipes

| Recipe                                       | What it does                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `byZoom(stops, curve?)`                      | A value that changes with zoom (`exponential(1.5)` by default).                                      |
| `metersToPixels(meters, latitude)`           | A size in pixels that stays a fixed real-world distance at every zoom, e.g. a 500 m `circle-radius`. |
| `ifFeatureState(state, whenTrue, whenFalse)` | Hover/selected styling via feature state; an unset state counts as false.                            |
| `getOr(property, fallback)`                  | A property, or the fallback if it's missing _or has the wrong type_.                                 |
| `isOneOf(input, values)`                     | Membership test that compiles to a fast `match`; no `literal` to forget.                             |
| `between(input, min, max)`                   | Inclusive range test.                                                                                |
| `matchRecord(input, record, fallback)`       | `match` from a plain object, e.g. a category-to-color palette.                                       |
| `compactNumber(input, options?)`             | `1234` becomes `"1.2k"`, `5600000` becomes `"5.6M"`, e.g. for cluster counts.                        |
| `withAlpha(color, alpha)`                    | The same color with a different opacity.                                                             |
| `mixColors(from, to, ratio, space?)`         | Blend two colors in RGB, HCL or Lab.                                                                 |

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

## Contributing

Every operator is tested by evaluating it with MapLibre's engine, not by comparing array shapes. A test fails if the style spec gains an operator without a wrapper, and a weekly CI job runs the suite against the latest spec. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, the code layout, the type design rules and how releases work.

## About

Built and maintained by [Built by Field](https://www.builtbyfield.com), a design and technology studio. We use it in the map-heavy apps we build, and fix what we find along the way. Need help with a MapLibre project? [Get in touch](https://www.builtbyfield.com/contact).

## License

MIT
