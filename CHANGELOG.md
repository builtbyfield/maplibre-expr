# @builtbyfield/maplibre-expr

## 0.4.1

### Patch Changes

- [#37](https://github.com/builtbyfield/maplibre-expr/pull/37) [`c63d7e4`](https://github.com/builtbyfield/maplibre-expr/commit/c63d7e4ce73b0dfd8b57bb5168f21ca93849f7dc) Thanks [@essejmclean](https://github.com/essejmclean)! - Reworded the README, the package description and the JSDoc so they read more plainly. No code changes.

## 0.4.0

### Minor Changes

- [#31](https://github.com/builtbyfield/maplibre-expr/pull/31) [`a4185b8`](https://github.com/builtbyfield/maplibre-expr/commit/a4185b8cd2c6f2d1e7e5d00edc897d567b5c5092) Thanks [@essejmclean](https://github.com/essejmclean)! - Remove the `between`, `matchRecord` and `mixColors` recipes. Each was a thin wrapper with no pitfall to protect against, so it didn't earn a place in the API. Write them with the operators instead:
  
  - `between(x, min, max)` → `all(gte(x, min), lte(x, max))`, or `let_` if `x` is expensive
  - `matchRecord(input, { a: 1, b: 2 }, 0)` → `match(input, Object.entries({ a: 1, b: 2 }), 0)`
  - `mixColors(from, to, ratio)` → `interpolate(linear(), ratio, [[0, from], [1, to]])` (`interpolateHcl` or `interpolateLab` for the other color spaces)

- [#30](https://github.com/builtbyfield/maplibre-expr/pull/30) [`027c907`](https://github.com/builtbyfield/maplibre-expr/commit/027c90722d676469f511b242007c2405989a510e) Thanks [@essejmclean](https://github.com/essejmclean)! - Add `lintStyle(style)` to `/testing`. It runs MapLibre's style validator over a whole style and reports each problem by layer id and property, plus three checks the validator doesn't do: expression filters that aren't booleans (maplibre-gl throws for these), comparisons of two literals in paint and layout properties (always constant), and color ramps that fade to `"transparent"` (they pass through grey).

- [#33](https://github.com/builtbyfield/maplibre-expr/pull/33) [`e3e35ab`](https://github.com/builtbyfield/maplibre-expr/commit/e3e35ab8955e95569b4c34a38ec65504a5a833e4) Thanks [@essejmclean](https://github.com/essejmclean)! - New recipes, each checked against MapLibre's engine and patterns in 39 real styles:
  
  - `byZoomMatch(input, branches, fallback, curve?)`: a different zoom ramp per category, e.g. road width by class. MapLibre rejects the obvious `match` of zoom ramps; this builds the single ramp it accepts, with every category's ramp exact.
  - `classify(input, breaks, outputs, noData)`: choropleth classes, with missing and non-numeric values sent to `noData` instead of the property's default.
  - `localizedName(languages, options?)`: the name in the first available language, falling back to `name`. A language can be `globalState("lang")` to switch language at runtime, and `secondLine` adds the local name under a translation when it differs.
  - `firstNonEmpty(...values)`: like `coalesce`, but also skips `""`.
  - `contrastText(background, options?)`: black or white text, whichever has more contrast with a data-driven background (WCAG 2).
  - `toColorOr(value, fallback, options?)`: a color from feature data with a fallback for missing, empty and invalid values, which `coalesce` draws black; `hashlessHex` reads GTFS-style `"FF0000"`.
  - `isNoneOf(input, values)`: the negation of `isOneOf`, true for missing values like legacy `!in`.
  - `ifFeatureState([[state, value], ...], fallback)`: several states in priority order.
  
  Breaking changes:
  
  - `compactNumber` reads abbreviations from `Intl.NumberFormat` for the locale, and its output now matches `Intl`'s compact notation: `"1.2K"` (was `"1.2k"`), `"57K"` (was `"56.8k"`), `"1,2 Mio."` in German, `"12L"` in Indian English. `locale` defaults to `"en"` (it was the device's locale for separators). New options: `currency`, `unit`, `minimum` and custom `scales`; `maxFractionDigits` still gives fixed decimals.
  - `byZoom` uses `linear()` by default when a stop is a color or projection string. `exponential(1.5)` remains the default for numbers. Pass `exponential(1.5)` to keep the old color fades.

## 0.3.3

### Patch Changes

- [#25](https://github.com/builtbyfield/maplibre-expr/pull/25) [`2999db3`](https://github.com/builtbyfield/maplibre-expr/commit/2999db38b48612cac4d5ba61927fcee7b9958c37) Thanks [@essejmclean](https://github.com/essejmclean)! - `validate(expr, { property: "filter" })` rejects filters that aren't booleans, like `add(1, 2)`. MapLibre's style validator accepts them, but maplibre-gl throws when it creates the layer, and a style that contains one never finishes loading. Filter errors are also reported under `filter` instead of `.filter`.

## 0.3.2

### Patch Changes

- [#11](https://github.com/builtbyfield/maplibre-expr/pull/11) [`d23cf94`](https://github.com/builtbyfield/maplibre-expr/commit/d23cf9464d6a831784090e3207cbad53be7e1f3d) Thanks [@essejmclean](https://github.com/essejmclean)! - `checkEquivalent`/`assertEquivalent` find differences more reliably and report them more readably. Each property and state tries the literals it's actually compared against more often; coordinates inside `distance`/`within` and property names are no longer used as values; and the first item of a `match` label array is no longer skipped. A counterexample is shrunk to the properties and state that matter, and leaves out zoom, geometry and state the expressions don't read.

## 0.3.1

### Patch Changes

- [#9](https://github.com/builtbyfield/maplibre-expr/pull/9) [`4f82280`](https://github.com/builtbyfield/maplibre-expr/commit/4f822802c1a90f09a5b8649bcc33d8593f308ca9) Thanks [@essejmclean](https://github.com/essejmclean)! - `evaluate` and `checkEquivalent` accept `properties`, `featureState` and `globalState` typed as interfaces (no index signature needed), so a feature's typed properties can be passed as is.

## 0.3.0

### Minor Changes

- [#7](https://github.com/builtbyfield/maplibre-expr/pull/7) [`0b8ef59`](https://github.com/builtbyfield/maplibre-expr/commit/0b8ef59bdc4a63c134c70c3db27d452b9d63fb82) Thanks [@essejmclean](https://github.com/essejmclean)! - - `assertEquivalent` and `checkEquivalent` in `/testing`: compare two expressions on generated cases (built from the literals they use, including values just either side of each number) and report a counterexample when they differ. For refactors and style migrations.
  - Typed accessors (`typedProperties`, `typedFeatureState`, `typedGlobalState`) type values as when present: `null` and `undefined` in the declared type are dropped, so nullable schema types (e.g. from zod) work as is. Exports the `Present<T>` helper type.
  - `match` accepts plain (non-`as const`) arrays as labels, like `isOneOf`; an empty array still throws.

## 0.2.0

### Minor Changes

- [#5](https://github.com/builtbyfield/maplibre-expr/pull/5) [`37bddf8`](https://github.com/builtbyfield/maplibre-expr/commit/37bddf8ad83fed6184003cbcfdfab7b6be224d92) Thanks [@essejmclean](https://github.com/essejmclean)! - **New**
  
  - `typedProperties<P>()`, `typedFeatureState<S>()` and `typedGlobalState<G>()`: accessors that make misspelled property and state names compile errors and type their values.
  - `syncGlobalState(map, name, value)`: keeps a global-state property set on a map, including before the style loads and after a full style reload.
  - `validate(expr, { property })` checks an expression as the value of a real layer property (or `"filter"`) with MapLibre's style validator.
  - `evaluate` and `validate` accept plain values and `Input<T>` unions as well as expressions.
  - `interpolate` and `byZoom` accept projection stops; color-array ramps are typed; `evaluate` converts projections, color arrays and number arrays to plain values.
  - `typeof_` returns the closed set of type names, so comparing against a misspelled one is a type error.
  - `case_`, `match`, `step` and `coalesce` accept CSS color strings and color expressions in the same call (e.g. `rgb()` branches with a `"#000"` fallback), typed as a color.
  
  **Changed**
  
  - Ships a CommonJS build alongside ESM, so `require()` and Jest work without extra configuration.
  - `/testing` bundles its own copy of MapLibre's expression engine. The package no longer has a peer dependency on `@maplibre/maplibre-gl-style-spec`, so it installs alongside any style-spec or maplibre-gl version.
  - `toSpec` returns `readonly [OperatorName, ...unknown[]]` instead of MapLibre's `ExpressionSpecification`.
  - Builders throw for mistakes MapLibre would reject or misread: comparing a string literal to a literal (read as legacy filter syntax in filters; the error suggests `geometryType()` or `id()` for `"$type"` and `"$id"`), non-integer or empty `match`/`isOneOf` labels, and out-of-range literal `rgb`/`rgba` components.
  
  **Fixed**
  
  - `validate(expr, { property: "line-gradient" })` no longer fails on a missing `lineMetrics` source setting.
  - The `/testing` types resolve under `moduleResolution: "node"` (TypeScript 6 and older).
  
  - `compactNumber` switches units where rounding would show "1,000k" or "1,000M", and rounds values below 1,000.
  - `numberFormat` works around MapLibre ignoring a fraction-digit setting of `0`.
  
  **Docs**
  
  - GL JS minimum versions and MapLibre Native gaps for each affected operator, a "Gotchas" section, a global-state guide, typed feature data, writing your own helpers, and a checklist for AI coding agents.

## 0.1.1

### Patch Changes

- [#2](https://github.com/builtbyfield/maplibre-expr/pull/2) [`0cec2f1`](https://github.com/builtbyfield/maplibre-expr/commit/0cec2f157e233c1556ef2b2582b681030f917b33) Thanks [@essejmclean](https://github.com/essejmclean)! - Publish from GitHub Actions with npm provenance.

## 0.1.0

Initial release.
