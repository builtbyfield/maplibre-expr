import process from "node:process"

import { defineConfig } from "vite"

export default defineConfig({
  // GitHub Pages serves the demo from /maplibre-expr/; everywhere else it's /.
  base: process.env.BASE_PATH ?? "/",
  build: { target: "es2022" },
})
