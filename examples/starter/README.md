# maplibre-expr starter

A small, complete MapLibre app built with [`@builtbyfield/maplibre-expr`](../../README.md): a basemap from OpenFreeMap vector tiles and a month of real earthquakes, with a time slider. Every expression is typed, and the tests check them with MapLibre's own engine.

**[Open in StackBlitz](https://stackblitz.com/github/builtbyfield/maplibre-expr/tree/main/examples/starter)** | **[Live demo](https://builtbyfield.github.io/maplibre-expr/)**

## Try it

In StackBlitz (or locally with `npm install && npm run dev`):

1. **See a typo caught.** In `src/layers/basemap.ts`, change `"motorway"` to `"motorwy"`. The editor marks it: `transportation.get("class")` only accepts the road classes declared in `src/sources.ts`.
2. **See a logic bug caught.** In `src/layers/quakes.ts`, change `lte` to `lt` in `happenedBy`, then run `npm test`. The test that checks a quake appears at the exact moment it happens fails.
3. **See a migration checked.** `test/migration.test.ts` proves the typed roads and labels behave the same as hand-written JSON, and shows the one place they deliberately differ.

## What's where

```
src/sources.ts          typed property accessors for every tile layer (typedProperties)
src/palette.ts          light and dark palettes
src/layers/basemap.ts   land, water, borders, roads, buildings, labels
src/layers/quakes.ts    earthquakes: size by magnitude, color by depth,
                        a time filter read from global state, a recency fade
src/style.ts            assembles the style
src/main.ts             the map, the time slider (syncGlobalState), theme toggle, hover
public/quakes.geojson   the earthquake data
test/quakes.test.ts     evaluate(): the time filter over every quake, sizes, colors
test/style.test.ts      validate(): every expression, checked against the property it's used in
test/migration.test.ts  assertEquivalent(): a hand-written JSON "before" vs the typed rewrite
```

The patterns worth copying:

- **Declare the data once** (`src/sources.ts`), then every filter and paint property that reads it is checked.
- **Write expressions as functions of their inputs**, like `happenedBy(now)`. The layer passes `app.get("now")` (global state), and tests pass a fixed timestamp.
- **Keep changing values in global state.** The slider only calls `syncGlobalState`; the layer's filter never changes, so nothing is rebuilt.

## Commands

```sh
npm run dev        # start the app
npm test           # run the tests
npm run typecheck  # type-check
npm run build      # production build
```

## Data

- Earthquakes: [USGS](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) (public domain). M2.5+ quakes from 16 September to 16 October 2026, trimmed to magnitude, depth, time and place.
- Basemap: [OpenFreeMap](https://openfreemap.org), &copy; [OpenMapTiles](https://www.openmaptiles.org/), data from [OpenStreetMap](https://www.openstreetmap.org/copyright). No API key needed.
