import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts", "src/testing.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  publint: true,
  attw: true,
  // `/testing` ships its own copy of MapLibre's expression engine so it never
  // conflicts with the style-spec version an app (or maplibre-gl) uses.
  deps: { alwaysBundle: [/^@maplibre\/maplibre-gl-style-spec/] },
  // style-spec has no `exports` map; with platform "neutral" the resolver needs
  // to be told to use its `module`/`main` fields.
  inputOptions: { resolve: { mainFields: ["module", "main"] } },
})
