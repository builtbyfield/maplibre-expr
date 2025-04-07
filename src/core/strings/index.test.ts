import type {
  CollatorExpressionSpecification,
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { testExpression } from "../../utils/test-utils";
import { strings } from "./index";

describe("strings", () => {
  describe("compilation", () => {
    describe("isSupportedScript", () => {
      it("with string", () => {
        const expression = strings.isSupportedScript("दिल्ली");
        const compiled = [
          "is-supported-script",
          "दिल्ली",
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
      it("with expression", () => {
        const expression = strings.isSupportedScript(["get", "text"]);
        const compiled = [
          "is-supported-script",
          ["get", "text"],
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("upcase", () => {
      it("with string", () => {
        const expression = strings.upcase("Mixed Case");
        const compiled = [
          "upcase",
          "Mixed Case",
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
      it("with expression", () => {
        const expression = strings.upcase(["get", "text"]);
        const compiled = [
          "upcase",
          ["get", "text"],
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("downcase", () => {
      it("with string", () => {
        const expression = strings.downcase("Mixed Case");
        const compiled = [
          "downcase",
          "Mixed Case",
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
      it("with expression", () => {
        const expression = strings.downcase(["get", "text"]);
        const compiled = [
          "downcase",
          ["get", "text"],
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("concat", () => {
      it("with strings", () => {
        const expression = strings.concat("Hello", " ", "World");
        const compiled = [
          "concat",
          "Hello",
          " ",
          "World",
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
      it("with expressions", () => {
        const expression = strings.concat(["get", "greeting"], " ", [
          "get",
          "name",
        ]);
        const compiled = [
          "concat",
          ["get", "greeting"],
          " ",
          ["get", "name"],
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });

    describe("resolvedLocale", () => {
      it("with collator", () => {
        const collator = [
          "collator",
          { "case-sensitive": true, locale: "de" },
        ] satisfies CollatorExpressionSpecification;
        const expression = strings.resolvedLocale(collator);
        const compiled = [
          "resolved-locale",
          collator,
        ] satisfies ExpressionSpecification;
        expect(expression).toEqual(compiled);
      });
    });
  });

  describe("evaluation", () => {
    const feature: Feature = {
      type: "Unknown",
      properties: {
        text: "Mixed Case",
        greeting: "Hello",
        name: "World",
        emptyString: "",
        nonAscii: "こんにちは",
      },
    };

    describe("upcase", () => {
      it("should convert string to uppercase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.upcase("Mixed Case"),
          "MIXED CASE",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle property values", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.upcase(["get", "text"]),
          "MIXED CASE",
        ];
        testExpression(expression, feature, true);
      });
    });

    describe("downcase", () => {
      it("should convert string to lowercase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.downcase("Mixed Case"),
          "mixed case",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle property values", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.downcase(["get", "text"]),
          "mixed case",
        ];
        testExpression(expression, feature, true);
      });
    });

    describe("concat", () => {
      it("should concatenate strings", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.concat("Hello", " ", "World"),
          "Hello World",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle property values", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.concat(["get", "greeting"], " ", ["get", "name"]),
          "Hello World",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle empty strings", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.concat("", ["get", "text"], ""),
          "Mixed Case",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle multiple property values", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.concat(["get", "greeting"], ", ", ["get", "nonAscii"], "! ", [
            "get",
            "name",
          ]),
          "Hello, こんにちは! World",
        ];
        testExpression(expression, feature, true);
      });
    });

    describe("isSupportedScript", () => {
      it("should return true for ASCII text", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.isSupportedScript("Hello World"),
          true,
        ];
        testExpression(expression, feature, true);
      });

      it("should handle property values", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.isSupportedScript(["get", "text"]),
          true,
        ];
        testExpression(expression, feature, true);
      });

      it("should handle non-ASCII text", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.isSupportedScript(["get", "nonAscii"]),
          true, // Assuming Japanese is supported in the test environment
        ];
        testExpression(expression, feature, true);
      });
    });

    describe("resolvedLocale", () => {
      it("should handle collator with specific locale", () => {
        const expression: ExpressionSpecification = [
          "!=",
          strings.resolvedLocale([
            "collator",
            { "case-sensitive": true, locale: "de" },
          ]),
          "",
        ];
        testExpression(expression, feature, true);
      });

      it("should return different values for different locales", () => {
        const expression: ExpressionSpecification = [
          "!=",
          strings.resolvedLocale(["collator", { locale: "en" }]),
          strings.resolvedLocale(["collator", { locale: "de" }]),
        ];
        testExpression(expression, feature, true);
      });
    });

    describe("case conversion edge cases", () => {
      it("should handle empty string in upcase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.upcase(["get", "emptyString"]),
          "",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle empty string in downcase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.downcase(["get", "emptyString"]),
          "",
        ];
        testExpression(expression, feature, true);
      });

      it("should handle non-ASCII characters in upcase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.upcase(["get", "nonAscii"]),
          "こんにちは", // Japanese characters don't have case, should remain unchanged
        ];
        testExpression(expression, feature, true);
      });

      it("should handle non-ASCII characters in downcase", () => {
        const expression: ExpressionSpecification = [
          "==",
          strings.downcase(["get", "nonAscii"]),
          "こんにちは", // Japanese characters don't have case, should remain unchanged
        ];
        testExpression(expression, feature, true);
      });
    });
  });
});
