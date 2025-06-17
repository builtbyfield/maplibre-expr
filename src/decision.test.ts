import type {
  ExpressionSpecification,
  Feature,
  ICanonicalTileID,
} from "@maplibre/maplibre-gl-style-spec"
import { featureFilter } from "@maplibre/maplibre-gl-style-spec"
import { describe, expect, it } from "vitest"

import { getGeometry } from "../utils/geometry"
import { expressions as expr } from "./index"

describe("decision", () => {
  describe("compilation", () => {
    it("case", () => {
      const expression = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.5,
      ] satisfies ExpressionSpecification
      expect(
        expr.case([[["boolean", ["feature-state", "hover"], false], 1]], 0.5),
      ).toEqual(expression)
    })

    it("match", () => {
      const expression = [
        "match",
        ["get", "building_type"],
        "residential",
        "#f00",
        "commercial",
        "#0f0",
        "#000",
      ] satisfies ExpressionSpecification
      expect(
        expr.match(
          ["get", "building_type"],
          [
            ["residential", "#f00"],
            ["commercial", "#0f0"],
          ],
          "#000",
        ),
      ).toEqual(expression)
    })

    it("coalesce", () => {
      const expression = [
        "coalesce",
        ["image", ["concat", ["get", "icon"], "_15"]],
        ["image", "marker_15"],
      ] satisfies ExpressionSpecification
      expect(
        expr.coalesce(
          ["image", ["concat", ["get", "icon"], "_15"]],
          ["image", "marker_15"],
        ),
      ).toEqual(expression)
    })

    it("equal", () => {
      const expression = [
        "==",
        ["get", "building_type"],
        "residential",
      ] satisfies ExpressionSpecification
      expect(expr.equal(["get", "building_type"], "residential")).toEqual(
        expression,
      )
    })

    it("notEqual", () => {
      const expression = [
        "!=",
        ["get", "building_type"],
        "residential",
      ] satisfies ExpressionSpecification
      expect(expr.notEqual(["get", "building_type"], "residential")).toEqual(
        expression,
      )
    })

    it("greater", () => {
      const expression = [
        ">",
        ["get", "mag"],
        4,
      ] satisfies ExpressionSpecification
      expect(expr.greater(["get", "mag"], 4)).toEqual(expression)
    })

    it("less", () => {
      const expression = [
        "<",
        ["get", "mag"],
        4,
      ] satisfies ExpressionSpecification
      expect(expr.less(["get", "mag"], 4)).toEqual(expression)
    })

    it("greaterOrEqual", () => {
      const expression = [
        ">=",
        ["get", "mag"],
        4,
      ] satisfies ExpressionSpecification
      expect(expr.greaterOrEqual(["get", "mag"], 4)).toEqual(expression)
    })

    it("lessOrEqual", () => {
      const expression = [
        "<=",
        ["get", "mag"],
        4,
      ] satisfies ExpressionSpecification
      expect(expr.lessOrEqual(["get", "mag"], 4)).toEqual(expression)
    })

    it("all", () => {
      const expression = [
        "all",
        [">=", ["get", "mag"], 4],
        ["<", ["get", "mag"], 5],
      ] satisfies ExpressionSpecification
      expect(
        expr.all([">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]),
      ).toEqual(expression)
    })

    it("any", () => {
      const expression = [
        "any",
        [">=", ["get", "mag"], 4],
        ["<", ["get", "mag"], 5],
      ] satisfies ExpressionSpecification
      expect(
        expr.any([">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]),
      ).toEqual(expression)
    })

    it("within", () => {
      const polygon: GeoJSON.Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 5],
            [5, 5],
            [5, 0],
            [0, 0],
          ],
        ],
      }
      const expression = ["within", polygon] satisfies ExpressionSpecification
      expect(expr.within(polygon)).toEqual(expression)
    })
  })

  describe("evaluation", () => {
    const mockFeature: Feature = {
      type: "Point",
      geometry: [[{ x: 2, y: 2 }]],
      properties: {
        building_type: "residential",
        mag: 4.5,
        cluster: false,
        icon: "marker",
        status: "active",
      },
    }

    const mockCanonical = {
      z: 0,
      x: 0,
      y: 0,
      key: "0/0/0",
      url: () => "",
      isChildOf: () => false,
      getTilePoint: () => ({ x: 0, y: 0 }),
      equals: () => false,
    } satisfies ICanonicalTileID

    it("case evaluates conditions correctly", () => {
      const expression = expr.case(
        [[["==", ["get", "building_type"], "residential"], true]],
        false,
      )
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("match evaluates input correctly", () => {
      const expression = expr.match(
        ["get", "building_type"],
        [["residential", true]],
        false,
      )
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("equal evaluates comparison correctly", () => {
      const expression = expr.equal(["get", "building_type"], "residential")
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("notEqual evaluates comparison correctly", () => {
      const expression = expr.notEqual(["get", "building_type"], "commercial")
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("greater evaluates comparison correctly", () => {
      const expression = expr.greater(["get", "mag"], 4)
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("less evaluates comparison correctly", () => {
      const expression = expr.less(["get", "mag"], 5)
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("greaterOrEqual evaluates comparison correctly", () => {
      const expression = expr.greaterOrEqual(["get", "mag"], 4.5)
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("lessOrEqual evaluates comparison correctly", () => {
      const expression = expr.lessOrEqual(["get", "mag"], 4.5)
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("all evaluates conditions correctly", () => {
      const expression = expr.all(
        [">=", ["get", "mag"], 4],
        ["<", ["get", "mag"], 5],
      )
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("any evaluates conditions correctly", () => {
      const expression = expr.any(
        [">=", ["get", "mag"], 4],
        ["<", ["get", "mag"], 4],
      )
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("not evaluates condition correctly", () => {
      const expression = expr.not(["==", ["get", "cluster"], true])
      const result = featureFilter(expression).filter({ zoom: 0 }, mockFeature)
      expect(result).toBe(true)
    })

    it("within evaluates point correctly inside of polygon", () => {
      const expression = expr.within({
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 5],
            [5, 5],
            [5, 0],
            [0, 0],
          ],
        ],
      })

      getGeometry(
        mockFeature,
        { type: "Point", coordinates: [2, 2] },
        mockCanonical,
      )

      const result = featureFilter(expression).filter(
        { zoom: 0 },
        mockFeature,
        mockCanonical,
      )
      expect(result).toBe(true)
    })

    it("within evaluates point correctly outside of polygon", () => {
      const expression = expr.within({
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [0, 5],
            [5, 5],
            [5, 0],
            [0, 0],
          ],
        ],
      })

      getGeometry(
        mockFeature,
        { type: "Point", coordinates: [6, 6] },
        mockCanonical,
      )

      const result = featureFilter(expression).filter(
        { zoom: 0 },
        mockFeature,
        mockCanonical,
      )
      expect(result).toBe(false)
    })
  })
})
