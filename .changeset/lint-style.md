---
"@builtbyfield/maplibre-expr": minor
---

Add `lintStyle(style)` to `/testing`. It runs MapLibre's style validator over a whole style and reports each problem by layer id and property, plus three checks the validator doesn't do: expression filters that aren't booleans (maplibre-gl throws for these), comparisons of two literals in paint and layout properties (always constant), and color ramps that fade to `"transparent"` (grey halfway). Closes #20.
