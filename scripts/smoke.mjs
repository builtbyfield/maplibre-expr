// Installs the packed tarball in throwaway projects and checks it like a consumer would. Run after `pnpm build`.
import { Buffer } from "node:buffer"
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import process from "node:process"

const root = resolve(import.meta.dirname, "..")
const work = mkdtempSync(join(tmpdir(), "maplibre-expr-smoke-"))
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" })
const step = name => console.log(`\n${name}`)
let tarball

/** Creates a project in `work/<name>` with the tarball and `deps` installed. */
function project(name, deps, files) {
  const dir = join(work, name)
  mkdirSync(dir)
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name, private: true, type: "module" }))
  for (const [file, content] of Object.entries(files))
    writeFileSync(join(dir, file), content)
  run("npm", ["install", "--silent", "--no-audit", "--no-fund", join(work, tarball), ...deps], dir)
  return dir
}

function tsconfig(skipLibCheck) {
  return JSON.stringify({
    compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, noEmit: true, skipLibCheck },
    files: ["consumer.ts"],
  })
}

const layerConsumer = `
  import type { LayerSpecification, Map } from "maplibre-gl"
  import { add, byZoom, get, globalState, gt, match, syncGlobalState, upcase } from "@builtbyfield/maplibre-expr"

  export const layer: LayerSpecification = {
    id: "c", type: "circle", source: "s",
    filter: gt(get("ends_at"), globalState("now")),
    paint: {
      "circle-radius": byZoom([[10, 2], [16, add(get("size"), 4)]]),
      "circle-color": match(get("type"), [["park", "#0a0"]], "#888"),
    },
  }
  declare const map: Map
  export const stop: () => void = syncGlobalState(map, "now", Date.now())
  // @ts-expect-error string expression where a number is required
  export const bad = add(upcase("x"), 1)
`

try {
  step("pack")
  run("pnpm", ["pack", "--pack-destination", work], root)
  tarball = readdirSync(work).find(f => f.endsWith(".tgz"))

  step("bare project: no maplibre or style-spec installed")
  const bare = project("bare", ["typescript@^7", "ts54@npm:typescript@~5.4.0"], {
    "runtime.mjs": `
      import { add, get, interpolate, linear, zoom } from "@builtbyfield/maplibre-expr"
      import { evaluate, validate } from "@builtbyfield/maplibre-expr/testing"
      const value = evaluate(add(get("a"), interpolate(linear(), zoom(), [[0, 0], [10, 10]])), { properties: { a: 1 }, zoom: 5 })
      if (value !== 6) throw new Error("unexpected result " + value)
      const color = evaluate(interpolate(linear(), zoom(), [[0, "#000"], [10, "#fff"]]), { zoom: 5 })
      if (color !== "rgba(128,128,128,1)") throw new Error("unexpected color " + color)
      if (validate(get("w"), { property: "heatmap-intensity" }).valid) throw new Error("validate should reject data expressions in heatmap-intensity")
      if (validate(add(1, 2), { property: "filter" }).valid) throw new Error("validate should reject a filter that isn't a boolean")
      console.log("  ok: evaluate and validate run on the bundled engine")
    `,
    "consumer.ts": `
      import { add, get } from "@builtbyfield/maplibre-expr"
      import { evaluate } from "@builtbyfield/maplibre-expr/testing"
      export const n: number = evaluate(add(get<number>("a"), 1), { properties: { a: 1 } })
    `,
    "tsconfig.json": tsconfig(false),
    // Older setups resolve with moduleResolution "node", which ignores `exports`
    // (TypeScript 7 removed that mode, so this is checked with 5.4).
    "node10.ts": `
      import { add, get } from "@builtbyfield/maplibre-expr"
      import { evaluate } from "@builtbyfield/maplibre-expr/testing"
      export const n: number = evaluate(add(get<number>("a"), 1), { properties: { a: 1 } })
    `,
    "tsconfig.node10.json": JSON.stringify({
      compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "node", strict: true, noEmit: true, skipLibCheck: false },
      files: ["node10.ts"],
    }),
    "require.cjs": `
      const lib = require("@builtbyfield/maplibre-expr")
      const { evaluate } = require("@builtbyfield/maplibre-expr/testing")
      if (evaluate(lib.add(1, 2)) !== 3) throw new Error("require() of the package evaluated wrong")
      for (const entry of ["@builtbyfield/maplibre-expr", "@builtbyfield/maplibre-expr/testing"]) {
        if (!require.resolve(entry).endsWith(".cjs")) throw new Error(entry + " didn't resolve to the CommonJS build")
      }
      console.log("  ok: require() works from CommonJS (Node " + process.versions.node + ")")
    `,
  })
  if (existsSync(join(bare, "node_modules/@maplibre")))
    throw new Error("installing the package pulled in @maplibre packages")
  process.stdout.write(run("node", ["runtime.mjs"], bare))
  run("node", ["node_modules/typescript/bin/tsc", "-p", "."], bare)
  console.log("  ok: the package's own types check without skipLibCheck")
  run("node", ["node_modules/ts54/bin/tsc", "-p", "tsconfig.node10.json"], bare)
  console.log("  ok: types resolve with moduleResolution \"node\" (TypeScript 5.4)")
  process.stdout.write(run("node", ["require.cjs"], bare))

  step("maplibre-gl 6: TypeScript 7, 6 and the minimum supported 5.4")
  const gl6 = project("gl6", ["maplibre-gl@^6", "typescript@^7", "ts6@npm:@typescript/typescript6@^6", "ts54@npm:typescript@~5.4.0", "esbuild"], {
    "consumer.ts": layerConsumer,
    "tsconfig.json": tsconfig(true),
  })
  for (const tsc of ["node_modules/typescript/bin/tsc", "node_modules/ts6/bin/tsc6", "node_modules/ts54/bin/tsc"]) {
    run("node", [tsc, "-p", "."], gl6)
    console.log(`  ok: ${run("node", [tsc, "-v"], gl6).trim()}`)
  }

  step("maplibre-gl 5.24 (style-spec 24 types)")
  const gl5 = project("gl5", ["maplibre-gl@5.24", "typescript@^7"], { "consumer.ts": layerConsumer, "tsconfig.json": tsconfig(true) })
  run("node", ["node_modules/typescript/bin/tsc", "-p", "."], gl5)
  console.log("  ok: layer types and syncGlobalState(map) check against maplibre-gl 5.24")

  step("tree-shaking")
  writeFileSync(join(gl6, "entry.mjs"), `import { add } from "@builtbyfield/maplibre-expr"; console.log(add(1, 2))`)
  const bundle = run("npx", ["esbuild", "entry.mjs", "--bundle", "--minify", "--format=esm", "--platform=neutral"], gl6)
  const bytes = Buffer.byteLength(bundle)
  if (bytes > 500)
    throw new Error(`importing only \`add\` bundled ${bytes} bytes; tree-shaking is broken`)
  console.log(`  ok: importing \`add\` alone bundles to ${bytes} bytes`)

  console.log("\nsmoke test passed")
}
catch (error) {
  console.error("\nsmoke test failed:", error.message)
  process.exitCode = 1
}
finally {
  rmSync(work, { recursive: true, force: true })
}
