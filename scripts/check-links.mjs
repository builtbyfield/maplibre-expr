// Checks that every @see link into the expression docs points at the right heading.
import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import process from "node:process"

const PAGE = "https://maplibre.org/maplibre-style-spec/expressions/"
const src = resolve(import.meta.dirname, "../src")

const html = await (await fetch(PAGE)).text()
const anchors = new Map([...html.matchAll(/<h3 id="([^"]+)"[^>]*>([^<]*)</g)].map(([, id, title]) => [id, decode(title)]))
if (anchors.size < 80)
  throw new Error(`Found only ${anchors.size} operator headings on ${PAGE}; has the page layout changed?`)

const problems = []
let paired = 0
for (const file of readdirSync(src, { recursive: true }).filter(f => f.endsWith(".ts"))) {
  const text = readFileSync(join(src, file), "utf8")
  for (const [block] of text.matchAll(/\/\*\*[\s\S]*?\*\//g)) {
    const anchor = block.match(/@see https:\/\/maplibre\.org\/maplibre-style-spec\/expressions\/#(\S+)/)?.[1]
    if (anchor === undefined)
      continue
    if (!anchors.has(anchor)) {
      problems.push(`${file}: #${anchor} doesn't exist`)
      continue
    }
    const operator = block.match(/MapLibre `([^`]+)`/)?.[1]
    if (operator === undefined)
      continue
    paired++
    if (anchors.get(anchor) !== operator)
      problems.push(`${file}: #${anchor} is the heading for \`${anchors.get(anchor)}\`, expected \`${operator}\``)
  }
}

if (problems.length) {
  console.error(problems.join("\n"))
  process.exitCode = 1
}
else {
  console.log(`ok: ${paired} operator links checked`)
}

function decode(text) {
  return text.replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&amp;", "&").trim()
}
