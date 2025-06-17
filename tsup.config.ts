import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  dts: true,
  format: ["esm"],
  outDir: "dist",
  sourcemap: true,
  treeshake: true,
  target: "es2020",
})
