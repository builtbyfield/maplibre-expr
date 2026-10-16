---
"@builtbyfield/maplibre-expr": minor
---

- `assertEquivalent` and `checkEquivalent` in `/testing`: compare two expressions on generated cases (built from the literals they use, including values just either side of each number) and report a counterexample when they differ. For refactors and style migrations.
- Typed accessors (`typedProperties`, `typedFeatureState`, `typedGlobalState`) type values as when present: `null` and `undefined` in the declared type are dropped, so nullable schema types (e.g. from zod) work as is. Exports the `Present<T>` helper type.
- `match` accepts plain (non-`as const`) arrays as labels, like `isOneOf`; an empty array still throws.
