# @builtbyfield/maplibre-expr

[![npm](https://img.shields.io/npm/v/@builtbyfield/maplibre-expr)](https://www.npmjs.com/package/@builtbyfield/maplibre-expr)

Typed builders for [MapLibre style expressions](https://maplibre.org/maplibre-style-spec/expressions/). Wrong compositions fail to compile; the output is plain style-spec JSON.

```ts
import { add, get, interpolate, linear, upcase, zoom } from "@builtbyfield/maplibre-expr"

const width = interpolate(linear(), zoom(), [[10, 1], [16, add(get("lanes"), 2)]])
// ["interpolate", ["linear"], ["zoom"], 10, 1, 16, ["+", ["get", "lanes"], 2]]

add(upcase(get("name")), 1)
//  ~~~~~~~~~~~~~~~~~~~~ Argument of type 'Expr<string>' is not assignable to parameter of type 'NumberInput'.
```

MapLibre's own `ExpressionSpecification` type accepts `["+", ["upcase", "x"], 1]`, so mistakes like that only show up at runtime, as a console warning and a layer that silently renders wrong. Every builder here records what its expression evaluates to (`Expr<number>`, `Expr<string>`, `Expr<Color>`, and so on), so the compiler catches them instead.

- **All 88 operators** of the style spec (v26), each with JSDoc and a link to its spec entry.
- **Zero-cost output.** Builders return the same arrays you'd write by hand. They drop straight into layer `paint`/`layout`/`filter` and `map.setPaintProperty`, no casts. Importing one function adds about 170 bytes.
- **An evaluation harness** (`@builtbyfield/maplibre-expr/testing`) that runs expressions through MapLibre's real engine, for unit tests and for checking generated expressions.
- **A few recipes** for jobs that are fiddly to get right by hand: meters-to-pixels radii, compact number labels, hover states, alpha changes.

## Install

```sh
npm install @builtbyfield/maplibre-expr
```

Requires `@maplibre/maplibre-gl-style-spec` v26.3+ as a peer (maplibre-gl 6 already depends on it) and TypeScript 5.4+ if you use TypeScript. ESM only.

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

Some mistakes are caught when the expression is built:

- `interpolate` and `step` throw if stops aren't in ascending order.
- `let_`, `isOneOf` and `matchRecord` throw when given nothing to work with.

### What they don't check

- **Feature data is untyped by default.** `get`, `featureState`, `globalState` and `var_` produce values of unknown type that are accepted anywhere. MapLibre checks them at runtime. Pin a type to have the compiler check its uses: `get<number>("population")`.
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

Pass `property` (any layer property name, or `"filter"`) to check an expression where it will be used. That runs MapLibre's own style validator, which also catches data expressions in properties that don't support them, `zoom` outside a top-level ramp, and `feature-state` in filters and layout properties.

`evaluate` accepts the feature and map state an expression can read: `properties`, `id`, `geometry` (GeoJSON, used by `geometry-type`, `within` and `distance`), `zoom`, `featureState`, `globalState`, `heatmapDensity`, `lineProgress`, `elevation`, `accumulated`, `availableImages`, and the expected `type`.

**Using an AI coding assistant?** Ask it to check expressions with `evaluate` before wiring them into a style. Combined with the types, this lets it confirm an expression does what it says instead of guessing.

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

**Time-based styling.** Expressions can't read the clock, and baking `Date.now()` into a style freezes "now" at the moment the style is built. Put the time in global state instead and update it from your app:

```ts
filter: gt(get("ends_at"), globalState("now")) // events that haven't ended
map.setGlobalStateProperty("now", Date.now()) // e.g. every minute
```

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

## Development

```sh
pnpm install
pnpm test          # unit + type tests (watch mode)
pnpm check         # lint, typecheck, tests, build, and a smoke test of the packed tarball
pnpm check:links   # verify every @see link into the spec docs (needs network)
```

Every operator is tested by evaluating it with MapLibre's engine, not by comparing array shapes. `test/coverage.test.ts` fails if the installed style spec has an operator without a wrapper. A weekly CI job runs the suite against the latest spec.

## Releasing

Releases are managed with [Changesets](https://github.com/changesets/changesets):

1. In a PR that changes behavior, run `pnpm changeset`, pick patch/minor/major (while on 0.x, breaking changes are minor) and describe the change. Commit the generated file.
2. After merging to `main`, the Release workflow opens a "version packages" PR that bumps the version and updates `CHANGELOG.md`.
3. Merging that PR publishes to npm (trusted publishing, with provenance) and creates the GitHub release.

## License

MIT
