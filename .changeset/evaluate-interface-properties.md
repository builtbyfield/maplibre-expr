---
"@builtbyfield/maplibre-expr": patch
---

`evaluate` and `checkEquivalent` accept `properties`, `featureState` and `globalState` typed as interfaces (no index signature needed), so a feature's typed properties can be passed as is.
