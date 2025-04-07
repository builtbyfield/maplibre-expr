import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { constants } from "./constants";

describe("math", () => {
  describe("constants", () => {
    describe("compilation", () => {
      it("ln(2)", () => {
        const expression = constants.ln2();
        const compiled = ["ln2"] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });

      it("pi", () => {
        const expression = constants.pi();
        const compiled = ["pi"] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });

      it("e", () => {
        const expression = constants.e();
        // TODO: Figure out why 'e' is not included in the types
        // @ts-expect-error: e isn't included in MapLibre GL Style Spec types for some reason
        const compiled = ["e"] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("evaluation", () => {
      const feature: Feature = {
        type: "Unknown",
        properties: {},
      };

      describe("ln(2)", () => {
        it("should return ~0.69314", () => {
          const expression: ExpressionSpecification = [
            "all",
            [">", constants.ln2(), 0.693146],
            ["<", constants.ln2(), 0.693148],
          ];
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });

      describe("pi", () => {
        it("should return ~3.14159", () => {
          const expression: ExpressionSpecification = [
            "all",
            [">", constants.pi(), 3.141591],
            ["<", constants.pi(), 3.141593],
          ];
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });

      describe("e", () => {
        it("should return ~2.71828", () => {
          const expression: ExpressionSpecification = [
            "all",
            [">", constants.e(), 2.718281],
            ["<", constants.e(), 2.718282],
          ];
          const expected = true;
          testExpression(expression, feature, expected);
        });
      });
    });
  });
});
