import antfu from "@antfu/eslint-config"

export default antfu({
  type: "lib",
  formatters: true,
  ignores: ["test/*.generated.ts"],
  stylistic: {
    quotes: "double",
  },
})
