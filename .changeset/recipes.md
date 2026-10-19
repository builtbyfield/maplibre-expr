---
"@builtbyfield/maplibre-expr": minor
---

New recipes, each checked against MapLibre's engine and patterns in 39 real styles:

- `byZoomMatch(input, branches, fallback, curve?)`: a different zoom ramp per category, e.g. road width by class. MapLibre rejects the obvious `match` of zoom ramps; this builds the single ramp it accepts, with every category's ramp exact.
- `classify(input, breaks, outputs, noData)`: choropleth classes, with missing and non-numeric values sent to `noData` instead of the property's default.
- `localizedName(languages, options?)`: the name in the first available language, falling back to `name`. A language can be `globalState("lang")` to switch language at runtime, and `secondLine` adds the local name under a translation when it differs.
- `firstNonEmpty(...values)`: like `coalesce`, but also skips `""`.
- `contrastText(background, options?)`: black or white text, whichever has more contrast with a data-driven background (WCAG 2).
- `colorOr(value, fallback, options?)`: a color from feature data with a fallback for missing, empty and invalid values, which `coalesce` draws black; `hashlessHex` reads GTFS-style `"FF0000"`.
- `isNoneOf(input, values)`: the negation of `isOneOf`, true for missing values like legacy `!in`.
- `ifFeatureState([[state, value], ...], fallback)`: several states in priority order.

Breaking changes:

- `compactNumber` reads abbreviations from `Intl.NumberFormat` for the locale, and its output now matches `Intl`'s compact notation: `"1.2K"` (was `"1.2k"`), `"57K"` (was `"56.8k"`), `"1,2 Mio."` in German, `"12L"` in Indian English. `locale` defaults to `"en"` (it was the device's locale for separators). New options: `currency`, `unit`, `minimum` and custom `scales`; `maxFractionDigits` still gives fixed decimals.
- `byZoom` uses `linear()` by default when a stop is a color or projection string. `exponential(1.5)` remains the default for numbers. Pass `exponential(1.5)` to keep the old color fades.
