import antfu from "@antfu/eslint-config"

export default antfu({
  type: "lib",
  formatters: true,
  ignores: ["test/*.generated.ts"],
  stylistic: {
    quotes: "double",
  },
}).append({
  // The examples are apps, not library code.
  files: ["examples/**"],
  rules: { "antfu/no-top-level-await": "off" },
})
