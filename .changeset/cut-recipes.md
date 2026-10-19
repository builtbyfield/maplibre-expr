---
"@builtbyfield/maplibre-expr": minor
---

Remove the `between`, `matchRecord` and `mixColors` recipes. Each was a thin wrapper with no pitfall to protect against, so it didn't earn a place in the API. Write them with the operators instead:

- `between(x, min, max)` → `all(gte(x, min), lte(x, max))`, or `let_` if `x` is expensive
- `matchRecord(input, { a: 1, b: 2 }, 0)` → `match(input, Object.entries({ a: 1, b: 2 }), 0)`
- `mixColors(from, to, ratio)` → `interpolate(linear(), ratio, [[0, from], [1, to]])` (`interpolateHcl` or `interpolateLab` for the other color spaces)
