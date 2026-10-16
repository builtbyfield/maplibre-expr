import { describe, expect, it } from "vitest"

import { validate } from "../src/testing"
import { examples } from "./jsdoc-examples.generated"

// Every JSDoc @example in src/ must build, and every expression it shows must
// be one MapLibre accepts. (tsc checks that they compile.)
describe("jSDoc examples", () => {
  it.each(examples.filter(([where]) => !where.startsWith("testing.ts")))("%s", (_, build) => {
    const value = build()
    if (Array.isArray(value) && typeof value[0] === "string")
      expect(validate(value as never)).toEqual({ valid: true, errors: [] })
  })
})
