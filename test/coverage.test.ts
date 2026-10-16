import { readdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"

import { describe, expect, it } from "vitest"

import * as lib from "../src"
import { OPERATOR_NAMES } from "../src/operator-names"

/** Spec operator to wrapper function. */
const WRAPPERS: Record<string, keyof typeof lib> = {
  "!": "not",
  "!=": "neq",
  "%": "mod",
  "*": "multiply",
  "+": "add",
  "-": "subtract",
  "/": "divide",
  "<": "lt",
  "<=": "lte",
  "==": "eq",
  ">": "gt",
  ">=": "gte",
  "^": "pow",
  "abs": "abs",
  "accumulated": "accumulated",
  "acos": "acos",
  "all": "all",
  "any": "any",
  "array": "array",
  "asin": "asin",
  "at": "at",
  "atan": "atan",
  "boolean": "boolean",
  "case": "case_",
  "ceil": "ceil",
  "coalesce": "coalesce",
  "collator": "collator",
  "concat": "concat",
  "cos": "cos",
  "distance": "distance",
  "downcase": "downcase",
  "e": "e",
  "elevation": "elevation",
  "feature-state": "featureState",
  "floor": "floor",
  "format": "format",
  "geometry-type": "geometryType",
  "get": "get",
  "global-state": "globalState",
  "has": "has",
  "heatmap-density": "heatmapDensity",
  "id": "id",
  "image": "image",
  "in": "in_",
  "index-of": "indexOf",
  "interpolate": "interpolate",
  "interpolate-hcl": "interpolateHcl",
  "interpolate-lab": "interpolateLab",
  "is-supported-script": "isSupportedScript",
  "join": "join",
  "length": "length",
  "let": "let_",
  "line-progress": "lineProgress",
  "literal": "literal",
  "ln": "ln",
  "ln2": "ln2",
  "log10": "log10",
  "log2": "log2",
  "match": "match",
  "max": "max",
  "min": "min",
  "number": "number",
  "number-format": "numberFormat",
  "object": "object",
  "pi": "pi",
  "properties": "properties",
  "resolved-locale": "resolvedLocale",
  "rgb": "rgb",
  "rgba": "rgba",
  "round": "round",
  "semiliteral": "semiliteral",
  "sin": "sin",
  "slice": "slice",
  "split": "split",
  "sqrt": "sqrt",
  "step": "step",
  "string": "string",
  "tan": "tan",
  "to-boolean": "toBoolean",
  "to-color": "toColor",
  "to-number": "toNumber",
  "to-rgba": "toRgba",
  "to-string": "toString",
  "typeof": "typeof_",
  "upcase": "upcase",
  "var": "var_",
  "within": "within",
  "zoom": "zoom",
}

// The runtime `latest` export strips expression docs; the JSON file keeps them.
const spec = createRequire(import.meta.url)("@maplibre/maplibre-gl-style-spec/dist/latest.json") as Record<string, unknown> & {
  expression_name: { values: Record<string, { "sdk-support"?: Record<string, Record<string, string>> }> }
}
const specOperators = Object.keys(spec.expression_name.values).sort()

describe("spec coverage", () => {
  it("wraps every operator in the installed style spec", () => {
    const unwrapped = specOperators.filter(name => !(name in WRAPPERS))
    expect(unwrapped, "spec operators without a wrapper").toEqual([])
  })

  it("has no wrappers for operators the spec doesn't define", () => {
    const unknown = Object.keys(WRAPPERS).filter(name => !specOperators.includes(name))
    expect(unknown).toEqual([])
  })

  it("exports every wrapper as a function", () => {
    for (const fn of Object.values(WRAPPERS))
      expect(typeof lib[fn], fn).toBe("function")
  })

  it("keeps the internal operator-name list in sync with the spec", () => {
    expect([...OPERATOR_NAMES].sort()).toEqual(specOperators)
  })
  it("notes GL JS minimums and MapLibre Native gaps from the spec's support table", () => {
    const sources = readdirSync(new URL("../src/operators", import.meta.url))
      .map(file => readFileSync(new URL(`../src/operators/${file}`, import.meta.url), "utf8"))
      .join("\n")
    const problems: string[] = []
    for (const [op, fn] of Object.entries(WRAPPERS)) {
      const doc = sources.match(new RegExp(`/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\nexport function ${fn.replace("$", "\\$")}\\b`))?.[1]?.replace(/[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*\* ?/g, " ") ?? ""
      const support = spec.expression_name.values[op]?.["sdk-support"]?.["basic functionality"] ?? {}
      const js = /^(\d+)\.(\d+)/.exec(support.js ?? "")
      const needsJs = js && Number(js[1]) >= 4 ? `Requires MapLibre GL JS ${js[1]}.${js[2]}+.` : undefined
      const nativeIssue = support.android?.startsWith("http") ? support.android : undefined
      if (needsJs ? !doc.includes(needsJs) : doc.includes("Requires MapLibre GL JS"))
        problems.push(`${fn}: expected ${needsJs ?? "no GL JS version note"}`)
      if (nativeIssue ? !doc.includes(nativeIssue) : doc.includes("MapLibre Native"))
        problems.push(`${fn}: expected ${nativeIssue ? `a Native note linking ${nativeIssue}` : "no Native note"}`)
    }
    expect(problems).toEqual([])
  })

  it("keeps the generated style property names in sync with the spec", () => {
    const source = readFileSync(new URL("../src/style-properties.ts", import.meta.url), "utf8")
    const union = source.slice(source.indexOf("export type StylePropertyName"))
    const listed = [...union.matchAll(/"([^"]+)"/g)].map(m => m[1]).sort()
    const fromSpec = [...new Set(Object.entries(spec).filter(([key]) => /^(?:paint|layout)_/.test(key)).flatMap(([, props]) => Object.keys(props as object)))].sort()
    expect(listed).toEqual(fromSpec)
  })

  it("lists every operator in the README table", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8")
    const table = readme.slice(readme.indexOf("## Operators"), readme.indexOf("## Development"))
    const missing = Object.entries(WRAPPERS)
      .map(([op, fn]) => (op === fn ? `\`${op}\`` : `\`${op}\` (\`${fn}\`)`))
      .filter(entry => !table.includes(entry))
    expect(missing).toEqual([])
  })
})
