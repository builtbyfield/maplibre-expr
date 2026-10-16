---
"@builtbyfield/maplibre-expr": minor
---

**New**

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
