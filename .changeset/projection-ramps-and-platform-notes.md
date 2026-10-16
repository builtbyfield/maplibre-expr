---
"@builtbyfield/maplibre-expr": minor
---

- `interpolate` and `byZoom` accept projection stops (`"vertical-perspective"`, `"mercator"`) and return `Expr<Projection>`; color-array ramps are typed for `interpolate`, `interpolateHcl` and `interpolateLab`.
- `evaluate` converts projections, color arrays and number arrays to plain values, and retries ambiguous ramps as projections and color arrays.
- Docs note the minimum MapLibre GL JS version and MapLibre Native gaps for each affected operator, plus two upstream quirks (`distance` on MultiLineString features, `toColor` with `[r, g, b, a]` arrays).
- The `@maplibre/maplibre-gl-style-spec` peer range is now `>=26.3.0`, the first version with every wrapped operator.
