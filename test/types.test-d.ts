import type {
  CircleLayerSpecification,
  ExpressionSpecification,
  FilterSpecification,
  ProjectionSpecification,
  SymbolLayerSpecification,
} from "@maplibre/maplibre-gl-style-spec"

import type { Color, Expr, Formatted, Projection } from "../src"

import { describe, expectTypeOf, it } from "vitest"

import {
  add,
  at,
  byZoom,
  case_,
  coalesce,
  concat,
  divide,
  eq,
  format,
  geometryType,
  get,
  getOr,
  gt,
  interpolate,
  isOneOf,
  let_,
  linear,
  literal,
  match,
  rgb,
  split,
  step,
  toRgba,
  upcase,
  zoom,
} from "../src"
import { evaluate } from "../src/testing"

describe("output types", () => {
  it("tracks what each expression evaluates to", () => {
    expectTypeOf(add(1, 2)).toEqualTypeOf<Expr<number>>()
    expectTypeOf(upcase("a")).toEqualTypeOf<Expr<string>>()
    expectTypeOf(rgb(1, 2, 3)).toEqualTypeOf<Expr<Color>>()
    expectTypeOf(format("a")).toEqualTypeOf<Expr<Formatted>>()
    expectTypeOf(at(0, split("a b", " "))).toEqualTypeOf<Expr<string>>()
    expectTypeOf(toRgba("#fff")).toEqualTypeOf<Expr<readonly [number, number, number, number]>>()
    expectTypeOf(literal(["a", "b"])).toEqualTypeOf<Expr<readonly ["a", "b"]>>()
  })

  it("infers ramp outputs from stops", () => {
    expectTypeOf(interpolate(linear(), zoom(), [[0, 1], [10, 2]])).toEqualTypeOf<Expr<number>>()
    expectTypeOf(interpolate(linear(), zoom(), [[0, "#000"], [10, rgb(1, 2, 3)]])).toEqualTypeOf<Expr<Color>>()
    expectTypeOf(step(zoom(), "a", [[5, "b"]])).toEqualTypeOf<Expr<string>>()
    expectTypeOf(byZoom([[0, 1], [10, 2]])).toEqualTypeOf<Expr<number>>()
    expectTypeOf(byZoom([[0, "#000"], [10, "#fff"]])).toEqualTypeOf<Expr<Color>>()
    expectTypeOf(interpolate(linear(), zoom(), [[10, "vertical-perspective"], [12, "mercator"]])).toEqualTypeOf<Expr<Projection>>()
    expectTypeOf(byZoom([[10, "vertical-perspective"], [12, "mercator"]], linear())).toEqualTypeOf<Expr<Projection>>()
    expectTypeOf(interpolate(linear(), zoom(), [[0, literal(["#000"])], [10, literal(["#fff"])]])).toEqualTypeOf<Expr<readonly Color[]>>()
  })

  it("infers branch outputs", () => {
    expectTypeOf(case_([[gt(get("n"), 1), 10]], 0)).toEqualTypeOf<Expr<number>>()
    expectTypeOf(match(get("t"), [["a", "x"]], "y")).toEqualTypeOf<Expr<string>>()
    expectTypeOf(coalesce(get<string>("a"), "b")).toEqualTypeOf<Expr<string>>()
  })

  it("types let_ variables from their values", () => {
    let_({ ratio: divide(get("a"), get("b")), label: "x" }, (vars) => {
      expectTypeOf(vars.ratio).toEqualTypeOf<Expr<number>>()
      expectTypeOf(vars.label).toEqualTypeOf<Expr<string>>()
      return vars.ratio
    })
  })

  it("types recipe overloads", () => {
    expectTypeOf(getOr("name", "")).toEqualTypeOf<Expr<string>>()
    expectTypeOf(getOr("height", 0)).toEqualTypeOf<Expr<number>>()
  })

  it("maps evaluated values to plain JavaScript", () => {
    expectTypeOf(evaluate(add(1, 2))).toEqualTypeOf<number>()
    expectTypeOf(evaluate(rgb(1, 2, 3))).toEqualTypeOf<string>()
    expectTypeOf(evaluate(split("a", ","))).toEqualTypeOf<string[]>()
    expectTypeOf(evaluate(interpolate(linear(), zoom(), [[10, "vertical-perspective"], [12, "mercator"]])))
      .toEqualTypeOf<{ from: string, to: string, transition: number }>()
  })
})

describe("rejects wrong compositions", () => {
  it("type mismatches in operator arguments", () => {
    // @ts-expect-error string expression where a number is required
    add(upcase("x"), 1)
    // @ts-expect-error color where a number is required
    add(rgb(1, 2, 3), 1)
    // @ts-expect-error color where a string is required
    upcase(rgb(1, 2, 3))
    // @ts-expect-error formatted text where a string is required
    upcase(format("a"))
    // @ts-expect-error pinned property type is checked
    upcase(get<number>("height"))
    // @ts-expect-error let_ variables keep their types
    let_({ n: add(1, 2) }, ({ n }) => upcase(n))
  })

  it("comparisons between different types", () => {
    // @ts-expect-error number compared to string
    eq(add(1, 2), "x")
    // @ts-expect-error misspelled geometry type
    eq(geometryType(), "Polgon")
    // @ts-expect-error misspelled geometry type in a match label
    match(geometryType(), [["Polgon", 1]], 0)
    // @ts-expect-error misspelled geometry type in isOneOf
    isOneOf(geometryType(), ["Polgon"])
  })

  it("mixed branch outputs", () => {
    // @ts-expect-error case outputs must share a type
    case_([[true, 1]], "x")
  })

  it("structural mistakes", () => {
    // @ts-expect-error interpolate needs at least one stop
    interpolate(linear(), zoom(), [])
    // @ts-expect-error add needs at least two inputs
    add(1)
    // @ts-expect-error bare JS arrays aren't expressions; wrap in literal()
    at(0, ["a", "b"])
  })
})

describe("interoperates with MapLibre types", () => {
  it("is assignable to ExpressionSpecification without casts", () => {
    expectTypeOf(add(get("a"), 1)).toExtend<ExpressionSpecification>()
    expectTypeOf(eq(get("a"), 1)).toExtend<FilterSpecification>()
  })

  it("fits layer paint, layout and filter properties", () => {
    const circle: CircleLayerSpecification = {
      id: "c",
      type: "circle",
      source: "s",
      filter: isOneOf(get("class"), ["a", "b"]),
      paint: {
        "circle-radius": byZoom([[10, 2], [16, add(get("size"), 4)]]),
        "circle-color": match(get("type"), [["park", "#0a0"]], "#888"),
      },
    }
    const symbol: SymbolLayerSpecification = {
      id: "s",
      type: "symbol",
      source: "s",
      layout: { "text-field": format([get("name"), { "font-scale": 1.2 }]) },
    }
    const projection: ProjectionSpecification = { type: byZoom([[10, "vertical-perspective"], [12, "mercator"]], linear()) }
    expectTypeOf(projection).toExtend<ProjectionSpecification>()
    expectTypeOf(circle).toExtend<CircleLayerSpecification>()
    expectTypeOf(symbol).toExtend<SymbolLayerSpecification>()
  })

  it("accepts raw arrays and existing ExpressionSpecification values (unchecked)", () => {
    const existing: ExpressionSpecification = ["get", "x"]
    expectTypeOf(add(existing, 1)).toEqualTypeOf<Expr<number>>()
    expectTypeOf(add(["get", "x"], 1)).toEqualTypeOf<Expr<number>>()
    expectTypeOf(concat(["get", "x"], "!")).toEqualTypeOf<Expr<string>>()
  })
})
