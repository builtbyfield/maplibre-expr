// Type-checks, tests and builds examples/starter against the library built
// from this commit (not the published npm version). Run after `pnpm build`.
// `--out <dir>` copies the built site there (used by the Pages deploy).
import { execFileSync } from "node:child_process"
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import process from "node:process"

const root = resolve(import.meta.dirname, "..")
const outIndex = process.argv.indexOf("--out")
const out = outIndex > 0 ? resolve(process.argv[outIndex + 1]) : undefined
const work = mkdtempSync(join(tmpdir(), "maplibre-expr-starter-"))
const run = (cmd, args, cwd, env) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, ...env } })

try {
  run("pnpm", ["pack", "--pack-destination", work], root)
  const tarball = join(work, readdirSync(work).find(f => f.endsWith(".tgz")))

  const app = join(work, "starter")
  cpSync(join(root, "examples/starter"), app, { recursive: true, filter: src => !/node_modules|[/\\]dist$/.test(src) })
  const pkg = JSON.parse(readFileSync(join(app, "package.json"), "utf8"))
  pkg.dependencies["@builtbyfield/maplibre-expr"] = `file:${tarball}`
  writeFileSync(join(app, "package.json"), JSON.stringify(pkg, null, 2))

  run("npm", ["install", "--no-audit", "--no-fund", "--loglevel=error"], app)
  run("npm", ["run", "typecheck"], app)
  run("npm", ["test"], app)
  run("npm", ["run", "build"], app, out ? { BASE_PATH: process.env.BASE_PATH ?? "/maplibre-expr/" } : {})
  if (out) {
    rmSync(out, { recursive: true, force: true })
    cpSync(join(app, "dist"), out, { recursive: true })
    // The published demo's canonical URL, share image and structured data;
    // kept out of the starter so copies of it don't point at our URL.
    const index = join(out, "index.html")
    const head = readFileSync(join(root, "scripts/demo/head.html"), "utf8")
    writeFileSync(index, readFileSync(index, "utf8").replace("</head>", `${head}  </head>`))
    cpSync(join(root, "scripts/demo/og.png"), join(out, "og.png"))
    console.log(`starter: built site copied to ${out}`)
  }
  console.log("\nstarter: typecheck, tests and build passed")
}
catch (error) {
  console.error("\nstarter check failed:", error.message)
  process.exitCode = 1
}
finally {
  rmSync(work, { recursive: true, force: true })
}
