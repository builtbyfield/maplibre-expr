import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { logical } from "./logical";

describe("decision", () => {
  describe("logical", () => {
    // Test feature to be used across multiple tests
    const feature: Feature = {
      type: "Unknown",
      properties: {
        building_type: "residential",
        mag: 4.5,
        cluster: false,
        icon: "marker",
        status: "active",
        point_count: 0,
      },
    };

    describe("compilation", () => {
      describe("all/and", () => {
        it("compiles all with multiple expressions", () => {
          const expression = logical.all(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5],
            ["==", ["get", "status"], "active"]
          );
          const compiled = [
            "all",
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5],
            ["==", ["get", "status"], "active"],
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });

        it("compiles and as an alias of all", () => {
          const allExpression = logical.all(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5]
          );
          const andExpression = logical.and(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5]
          );
          expect(allExpression).toEqual(andExpression);
        });
      });

      describe("any/or", () => {
        it("compiles any with multiple expressions", () => {
          const expression = logical.any(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 3],
            ["==", ["get", "status"], "inactive"]
          );
          const compiled = [
            "any",
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 3],
            ["==", ["get", "status"], "inactive"],
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });

        it("compiles or as an alias of any", () => {
          const anyExpression = logical.any(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 3]
          );
          const orExpression = logical.or(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 3]
          );
          expect(anyExpression).toEqual(orExpression);
        });
      });

      describe("not", () => {
        it("compiles not with complex expression", () => {
          const expression = logical.not([
            "all",
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5],
          ]);
          const compiled = [
            "!",
            ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]],
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });
      });
    });

    describe("evaluation", () => {
      describe("all/and", () => {
        it("returns true for multiple true conditions", () => {
          const expression = logical.all(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5],
            ["==", ["get", "status"], "active"]
          );
          testExpression(expression, feature, true);
        });

        it("returns false when one condition is false in a chain", () => {
          const expression = logical.all(
            [">=", ["get", "mag"], 4],
            ["<", ["get", "mag"], 5],
            ["==", ["get", "status"], "inactive"]
          );
          testExpression(expression, feature, false);
        });

        it("evaluates and alias correctly", () => {
          const expression = logical.and(
            [">=", ["get", "mag"], 4],
            ["==", ["get", "cluster"], false]
          );
          testExpression(expression, feature, true);
        });
      });

      describe("any/or", () => {
        it("returns true when at least one condition is true", () => {
          const expression = logical.any(
            ["==", ["get", "mag"], 999],
            ["==", ["get", "status"], "active"],
            ["==", ["get", "building_type"], "commercial"]
          );
          testExpression(expression, feature, true);
        });

        it("returns false when all conditions are false", () => {
          const expression = logical.any(
            ["==", ["get", "mag"], 999],
            ["==", ["get", "status"], "inactive"],
            ["==", ["get", "building_type"], "commercial"]
          );
          testExpression(expression, feature, false);
        });

        it("evaluates or alias correctly", () => {
          const expression = logical.or(
            ["==", ["get", "mag"], 999],
            ["==", ["get", "cluster"], false]
          );
          testExpression(expression, feature, true);
        });
      });

      describe("not", () => {
        it("negates a true condition", () => {
          const expression = logical.not(["==", ["get", "cluster"], false]);
          testExpression(expression, feature, false);
        });

        it("negates a false condition", () => {
          const expression = logical.not(["==", ["get", "status"], "inactive"]);
          testExpression(expression, feature, true);
        });

        it("negates complex expressions", () => {
          const expression = logical.not(
            logical.all([">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5])
          );
          testExpression(expression, feature, false);
        });
      });

      describe("complex combinations", () => {
        it("combines all, any, and not operators", () => {
          const expression = logical.all(
            logical.not(["==", ["get", "cluster"], true]),
            logical.any(
              ["==", ["get", "status"], "active"],
              [">=", ["get", "mag"], 5]
            )
          );
          testExpression(expression, feature, true);
        });

        it("handles nested logical operations", () => {
          const expression = logical.or(
            logical.and([">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]),
            logical.not(["has", "point_count"])
          );
          testExpression(expression, feature, true);
        });
      });
    });
  });
});
