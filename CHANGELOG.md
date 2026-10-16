# @builtbyfield/maplibre-expr

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
