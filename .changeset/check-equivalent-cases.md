---
"@builtbyfield/maplibre-expr": patch
---

`checkEquivalent`/`assertEquivalent` find differences more reliably and report them more readably. Each property and state tries the literals it's actually compared against more often; coordinates inside `distance`/`within` and property names are no longer used as values; and the first item of a `match` label array is no longer skipped. A counterexample is shrunk to the properties and state that matter, and leaves out zoom, geometry and state the expressions don't read.
