import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { distance } from "./distance";

describe("math", () => {
  describe("distance", () => {
    describe("compilation", () => {
      it("compiles with point literal", () => {
        const expression = distance({ type: "Point", coordinates: [0, 0] });
        const compiled = [
          "distance",
          { type: "Point", coordinates: [0, 0] },
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });

      it("compiles with point expression", () => {
        const expression = distance(["get", "point"]);
        const compiled = [
          "distance",
          ["get", "point"],
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Point",
        geometry: [[{ x: 0, y: 0 }]],
        properties: {
          point: { type: "Point", coordinates: [1, 1] },
        },
      };

      describe("distance", () => {
        it("calculates distance to literal point", () => {
          // const expression = [
          //   "==",
          //   distance({ type: "Point", coordinates: [1, 1] }),
          //   // ~157km (approximate distance from [0,0] to [1,1])
          //   157000,
          // ] satisfies ExpressionSpecification;
          const expression = [
            "all",
            [">", distance({ type: "Point", coordinates: [1, 1] }), 156900],
            ["<", distance({ type: "Point", coordinates: [1, 1] }), 157100],
          ] satisfies ExpressionSpecification;
          testExpression(expression, feature, true);
        });

        it("calculates distance to point from properties", () => {
          const expression = [
            "==",
            distance(["get", "point"]),
            // ~157km (approximate distance from [0,0] to [1,1])
            157000,
          ] satisfies ExpressionSpecification;
          testExpression(expression, feature, true);
        });
      });
    });
  });
});
