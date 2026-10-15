import { Buffer } from "node:buffer"
// Installs the packed tarball in a temp project and checks it like a consumer would. Run after `pnpm build`.
import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import process from "node:process"

const root = resolve(import.meta.dirname, "..")
const work = mkdtempSync(join(tmpdir(), "maplibre-expr-smoke-"))
const run = (cmd, args, cwd = work) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" })
const step = name => console.log(`\n${name}`)

try {
  step("pack")
  run("pnpm", ["pack", "--pack-destination", work], root)
  const tarball = readdirSync(work).find(f => f.endsWith(".tgz"))

  step("install into a clean project")
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }))
  run("npm", [
    "install",
    "--silent",
    "--no-audit",
    "--no-fund",
    `./${tarball}`,
    "@maplibre/maplibre-gl-style-spec@^26",
    "typescript@^7",
    "ts6@npm:@typescript/typescript6@^6",
    "ts54@npm:typescript@~5.4.0",
    "esbuild",
  ])

  step("runtime imports")
  writeFileSync(join(work, "runtime.mjs"), `
    import { add, get, interpolate, linear, zoom } from "@builtbyfield/maplibre-expr"
    import { evaluate } from "@builtbyfield/maplibre-expr/testing"
    const value = evaluate(add(get("a"), interpolate(linear(), zoom(), [[0, 0], [10, 10]])), { properties: { a: 1 }, zoom: 5 })
    if (value !== 6) throw new Error("unexpected result " + value)
    console.log("  ok: evaluated to", value)
  `)
  process.stdout.write(run("node", ["runtime.mjs"]))

  step("consumer types (TypeScript 7, 6, and the minimum supported 5.4)")
  writeFileSync(join(work, "consumer.ts"), `
    import type { CircleLayerSpecification } from "@maplibre/maplibre-gl-style-spec"
    import { add, byZoom, eq, get, match, upcase } from "@builtbyfield/maplibre-expr"
    import { evaluate } from "@builtbyfield/maplibre-expr/testing"

    export const layer: CircleLayerSpecification = {
      id: "c", type: "circle", source: "s",
      filter: eq(get("kind"), "shop"),
      paint: {
        "circle-radius": byZoom([[10, 2], [16, add(get("size"), 4)]]),
        "circle-color": match(get("type"), [["park", "#0a0"]], "#888"),
      },
    }
    export const n: number = evaluate(add(1, 2))
    // @ts-expect-error string expression where a number is required
    export const bad = add(upcase("x"), 1)
  `)
  writeFileSync(join(work, "tsconfig.json"), JSON.stringify({
    compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, noEmit: true, skipLibCheck: false },
    files: ["consumer.ts"],
  }))
  for (const tsc of ["node_modules/typescript/bin/tsc", "node_modules/ts6/bin/tsc6", "node_modules/ts54/bin/tsc"]) {
    run("node", [tsc, "-p", "."])
    console.log(`  ok: ${run("node", [tsc, "-v"]).trim()}`)
  }

  step("tree-shaking")
  writeFileSync(join(work, "entry.mjs"), `import { add } from "@builtbyfield/maplibre-expr"; console.log(add(1, 2))`)
  const bundle = run("npx", ["esbuild", "entry.mjs", "--bundle", "--minify", "--format=esm", "--platform=neutral"])
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
