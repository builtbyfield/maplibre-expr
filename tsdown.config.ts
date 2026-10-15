import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts", "src/testing.ts"],
  format: "esm",
  platform: "neutral",
  target: "es2022",
  dts: true,
  sourcemap: true,
  clean: true,
  publint: true,
  attw: { profile: "esm-only" },
})
