// Writes dist/THIRD_PARTY_NOTICES.md for the code bundled into dist/testing.js.
// The bundled packages are read from rolldown's `//#region` markers, so the
// file always matches what's actually shipped.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const bundle = readFileSync(join(root, "dist/testing.js"), "utf8")

// Each region path looks like node_modules/.pnpm/<store-dir>/node_modules/<pkg>/...,
// possibly followed by .../node_modules/<inlined-pkg>/... for code the package
// had already inlined. pnpm links a package's dependencies next to it in the
// same store dir, which gives the exact version for inlined copies too.
const packages = new Map()
for (const [, path] of bundle.matchAll(/^\/\/#region (\S+)/gm)) {
  const store = /node_modules\/\.pnpm\/([^/]+)\/node_modules\//.exec(path)?.[1]
  if (!store)
    continue
  const names = [...path.matchAll(/node_modules\/((?:@[^/]+\/)?[^/.][^/]*)/g)].map(m => m[1])
  const name = names.at(-1)
  packages.set(name, join(root, "node_modules/.pnpm", store, "node_modules", name))
}

const sections = [...packages].sort(([a], [b]) => a.localeCompare(b)).map(([name, dir]) => {
  const { version, license } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))
  const file = readdirSync(dir).find(f => /^licen[sc]e/i.test(f))
  if (!file || !existsSync(join(dir, file)))
    throw new Error(`notices: ${name} has no license file`)
  return `## ${name}@${version} (${license})\n\n\`\`\`\n${readFileSync(join(dir, file), "utf8").trim()}\n\`\`\``
})

writeFileSync(join(root, "dist/THIRD_PARTY_NOTICES.md"), `# Third-party notices

\`dist/testing.js\` bundles the following packages.

${sections.join("\n\n")}
`)
console.log(`notices: ${[...packages.keys()].sort().join(", ")}`)
