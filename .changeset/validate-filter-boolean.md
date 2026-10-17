---
"@builtbyfield/maplibre-expr": patch
---

`validate(expr, { property: "filter" })` rejects filters that aren't booleans, like `add(1, 2)`. MapLibre's style validator accepts them, but maplibre-gl throws when it creates the layer, and a style that contains one never finishes loading. Filter errors are also reported under `filter` instead of `.filter`.
