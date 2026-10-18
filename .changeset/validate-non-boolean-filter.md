---
"@builtbyfield/maplibre-expr": patch
---

`validate(expression, { property: "filter" })` now rejects expression filters that aren't booleans (like `add(1, 2)` or `upcase("x")`), matching maplibre-gl, instead of reporting them as valid.
