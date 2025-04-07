import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { heatmap } from "./index";

describe("heatmap", () => {
  describe("compilation", () => {
    describe("heatmapDensity", () => {
      it("should compile to a heatmap-density expression", () => {
        const expression = heatmap.heatmapDensity();
        const compiled = ["heatmap-density"] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });
  });

  describe("evaluation", () => {
    const feature: Feature = {
      type: "Point",
      geometry: [[{ x: 0, y: 0 }]],
      properties: {},
    };

    describe("heatmapDensity", () => {
      it("should evaluate density values between 0 and 1", () => {
        const expression = heatmap.heatmapDensity();

        // Test if density is greater than or equal to 0
        const greaterThanZero = [
          ">=",
          expression,
          0,
        ] satisfies ExpressionSpecification;

        // Test if density is less than or equal to 1
        const lessThanOne = [
          "<=",
          expression,
          1,
        ] satisfies ExpressionSpecification;

        const testBoth = [
          "all",
          greaterThanZero,
          lessThanOne,
        ] satisfies ExpressionSpecification;

        testExpression(testBoth, feature, true);
      });

      it("should handle density comparisons", () => {
        const expression = heatmap.heatmapDensity();

        // Test density threshold comparison
        const densityThreshold = [
          ">",
          expression,
          0.5,
        ] satisfies ExpressionSpecification;

        testExpression(densityThreshold, feature, false);
      });
    });
  });
});
