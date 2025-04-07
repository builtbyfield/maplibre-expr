import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { controlFlow } from "./control-flow";

describe("decision", () => {
  describe("control-flow", () => {
    describe("compilation", () => {
      describe("case", () => {
        it("should compile to a case expression", () => {
          const expression = controlFlow.case(
            [[["boolean", ["feature-state", "hover"], false], 1]],
            0.5
          );
          const compiled = [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.5,
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });
      });

      describe("match", () => {
        it("should compile to a match expression", () => {
          const expression = controlFlow.match(
            ["get", "building_type"],
            [
              ["residential", "#f00"],
              ["commercial", "#0f0"],
            ],
            "#000"
          );
          const compiled = [
            "match",
            ["get", "building_type"],
            "residential",
            "#f00",
            "commercial",
            "#0f0",
            "#000",
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });
      });

      describe("coalesce", () => {
        it("should compile to a coalesce expression", () => {
          const expression = controlFlow.coalesce(
            ["image", ["concat", ["get", "icon"], "_15"]],
            ["image", "marker_15"]
          );
          const compiled = [
            "coalesce",
            ["image", ["concat", ["get", "icon"], "_15"]],
            ["image", "marker_15"],
          ] satisfies ExpressionSpecification;
          expect(expression).toEqual(compiled);
        });
      });
    });

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {
          building_type: "residential",
          mag: 4.5,
          cluster: false,
          icon: "marker",
          status: "active",
        },
      };

      describe("case", () => {
        it("should return true", () => {
          const expression = controlFlow.case(
            [[["==", ["get", "building_type"], "residential"], true]],
            false
          );
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });

      describe("match", () => {
        it("should return true", () => {
          const expression = controlFlow.match(
            ["get", "building_type"],
            [["residential", true]],
            false
          );
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });

      describe("coalesce", () => {
        it("should return true", () => {
          const expression = [
            "==",
            controlFlow.coalesce(["get", "icon"], ["image", "pencil"]),
            "marker",
          ] satisfies ExpressionSpecification;
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });
    });
  });
});
