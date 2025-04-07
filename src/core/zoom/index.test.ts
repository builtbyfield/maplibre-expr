import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { zoom } from "./index";

describe("zoom", () => {
  describe("compilation", () => {
    describe("zoom", () => {
      it("should compile to a zoom expression", () => {
        const expression = zoom();
        const compiled = ["zoom"] satisfies ExpressionSpecification;
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

    describe("zoom", () => {
      it("should evaluate zoom levels correctly", () => {
        const expression = zoom();

        // Test zoom level 0
        const zoom0 = ["==", expression, 0] satisfies ExpressionSpecification;
        testExpression(zoom0, feature, true, { zoom: 0 });

        // Test zoom level 10
        const zoom10 = ["==", expression, 10] satisfies ExpressionSpecification;
        testExpression(zoom10, feature, true, { zoom: 10 });

        // Test zoom level 22
        const zoom22 = ["==", expression, 22] satisfies ExpressionSpecification;
        testExpression(zoom22, feature, true, { zoom: 22 });
      });

      it("should handle zoom comparisons", () => {
        const expression = zoom();

        // Test if zoom is greater than 10
        const aboveZoom10 = [
          ">",
          expression,
          10,
        ] satisfies ExpressionSpecification;

        testExpression(aboveZoom10, feature, true, { zoom: 15 });
        testExpression(aboveZoom10, feature, false, { zoom: 5 });
      });
    });
  });
});
