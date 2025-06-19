/* eslint-disable unicorn/new-for-builtins */
/* eslint-disable no-new-wrappers */

import { describe, expect, it } from "vitest"

import { deepUnbundle, unbundle } from "./unbundle"

describe("unbundle", () => {
  it("should convert Number wrapper objects to primitive numbers", () => {
    expect(unbundle(new Number(42))).toBe(42)
    expect(unbundle(new Number(0))).toBe(0)
    expect(unbundle(new Number(-123))).toBe(-123)
    expect(unbundle(new Number(3.14))).toBe(3.14)
    expect(unbundle(new Number(Number.NaN))).toBe(Number.NaN)
    expect(unbundle(new Number(Infinity))).toBe(Infinity)
    expect(unbundle(new Number(-Infinity))).toBe(-Infinity)
  })

  it("should convert String wrapper objects to primitive strings", () => {
    expect(unbundle(new String("hello"))).toBe("hello")
    expect(unbundle(new String(""))).toBe("")
    expect(unbundle(new String("123"))).toBe("123")
    expect(unbundle(new String("true"))).toBe("true")
  })

  it("should convert Boolean wrapper objects to primitive booleans", () => {
    expect(unbundle(new Boolean(true))).toBe(true)
    expect(unbundle(new Boolean(false))).toBe(false)
  })

  it("should return primitive values unchanged", () => {
    // Numbers
    expect(unbundle(42)).toBe(42)
    expect(unbundle(0)).toBe(0)
    expect(unbundle(-123)).toBe(-123)
    expect(unbundle(3.14)).toBe(3.14)
    expect(unbundle(Number.NaN)).toBe(Number.NaN)
    expect(unbundle(Infinity)).toBe(Infinity)
    expect(unbundle(-Infinity)).toBe(-Infinity)

    // Strings
    expect(unbundle("hello")).toBe("hello")
    expect(unbundle("")).toBe("")
    expect(unbundle("123")).toBe("123")

    // Booleans
    expect(unbundle(true)).toBe(true)
    expect(unbundle(false)).toBe(false)
  })

  it("should return other object types unchanged", () => {
    const obj = { key: "value" }
    const arr = [1, 2, 3]
    const func = () => {}
    const date = new Date()
    const regex = /test/

    expect(unbundle(obj)).toBe(obj)
    expect(unbundle(arr)).toBe(arr)
    expect(unbundle(func)).toBe(func)
    expect(unbundle(date)).toBe(date)
    expect(unbundle(regex)).toBe(regex)
  })

  it("should handle null and undefined", () => {
    expect(unbundle(null)).toBe(null)
    expect(unbundle(undefined)).toBe(undefined)
  })

  it("should handle symbols", () => {
    const sym = Symbol("test")
    expect(unbundle(sym)).toBe(sym)
  })
})

describe("deepUnbundle", () => {
  it("should convert primitive wrapper objects to primitives", () => {
    expect(deepUnbundle(new Number(42))).toBe(42)
    expect(deepUnbundle(new String("hello"))).toBe("hello")
    expect(deepUnbundle(new Boolean(true))).toBe(true)
  })

  it("should handle simple objects with wrapper objects", () => {
    const input = {
      num: new Number(42),
      str: new String("hello"),
      bool: new Boolean(true),
      plain: "unchanged",
    }

    const expected = {
      num: 42,
      str: "hello",
      bool: true,
      plain: "unchanged",
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle nested objects", () => {
    const input = {
      level1: {
        level2: {
          num: new Number(123),
          str: new String("nested"),
        },
        bool: new Boolean(false),
      },
      top: new String("top level"),
    }

    const expected = {
      level1: {
        level2: {
          num: 123,
          str: "nested",
        },
        bool: false,
      },
      top: "top level",
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle arrays", () => {
    const input = [
      new Number(1),
      new String("test"),
      new Boolean(true),
      "plain string",
    ]

    const expected = [1, "test", true, "plain string"]

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle nested arrays", () => {
    const input = [
      [new Number(1), new Number(2)],
      [new String("a"), new String("b")],
      new Boolean(true),
    ]

    const expected = [
      [1, 2],
      ["a", "b"],
      true,
    ]

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle objects with arrays", () => {
    const input = {
      numbers: [new Number(1), new Number(2), new Number(3)],
      strings: [new String("a"), new String("b")],
      booleans: [new Boolean(true), new Boolean(false)],
    }

    const expected = {
      numbers: [1, 2, 3],
      strings: ["a", "b"],
      booleans: [true, false],
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle complex nested structures", () => {
    const input = {
      user: {
        id: new Number(123),
        name: new String("John Doe"),
        active: new Boolean(true),
        preferences: {
          theme: new String("dark"),
          notifications: new Boolean(false),
        },
        tags: [new String("admin"), new String("user")],
      },
      metadata: {
        created: new String("2023-01-01"),
        version: new Number(1.0),
      },
    }

    const expected = {
      user: {
        id: 123,
        name: "John Doe",
        active: true,
        preferences: {
          theme: "dark",
          notifications: false,
        },
        tags: ["admin", "user"],
      },
      metadata: {
        created: "2023-01-01",
        version: 1.0,
      },
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should return primitive values unchanged", () => {
    expect(deepUnbundle(42)).toBe(42)
    expect(deepUnbundle("hello")).toBe("hello")
    expect(deepUnbundle(true)).toBe(true)
    expect(deepUnbundle(false)).toBe(false)
    expect(deepUnbundle(null)).toBe(null)
    expect(deepUnbundle(undefined)).toBe(undefined)
  })

  it("should handle empty objects and arrays", () => {
    expect(deepUnbundle({})).toEqual({})
    expect(deepUnbundle([])).toEqual([])
    expect(deepUnbundle({ empty: {} })).toEqual({ empty: {} })
    expect(deepUnbundle({ empty: [] })).toEqual({ empty: [] })
  })

  it("should handle objects with non-wrapper object properties", () => {
    const obj = { key: "value" }
    const arr = [1, 2, 3]
    const func = () => {}
    const date = new Date()
    const regex = /test/

    const input = {
      object: obj,
      array: arr,
      function: func,
      date,
      regex,
    }

    const expected = {
      object: obj,
      array: arr,
      function: func,
      date,
      regex,
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle edge cases with special number values", () => {
    const input = {
      nan: new Number(Number.NaN),
      infinity: new Number(Infinity),
      negativeInfinity: new Number(-Infinity),
      zero: new Number(0),
    }

    const expected = {
      nan: Number.NaN,
      infinity: Infinity,
      negativeInfinity: -Infinity,
      zero: 0,
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })

  it("should handle objects with mixed primitive and wrapper types", () => {
    const input = {
      mixed: {
        primitiveNum: 42,
        wrapperNum: new Number(100),
        primitiveStr: "hello",
        wrapperStr: new String("world"),
        primitiveBool: true,
        wrapperBool: new Boolean(false),
      },
    }

    const expected = {
      mixed: {
        primitiveNum: 42,
        wrapperNum: 100,
        primitiveStr: "hello",
        wrapperStr: "world",
        primitiveBool: true,
        wrapperBool: false,
      },
    }

    expect(deepUnbundle(input)).toEqual(expected)
  })
})
