import type {
  ExpressionSpecification,
  Feature,
} from "@maplibre/maplibre-gl-style-spec";
import { featureFilter } from "@maplibre/maplibre-gl-style-spec";
import { describe, expect, it } from "vitest";

import { expressions as expr } from "./index";

describe("types", () => {
  describe("Compilation", () => {
    describe("literal", () => {
      it("should create literal array expression", () => {
        const expression = expr.literal(["a", "b", "c"]);
        expect(expression).toEqual([
          "literal",
          ["a", "b", "c"],
        ] satisfies ExpressionSpecification);
      });

      it("should create literal object expression", () => {
        const expression = expr.literal({ foo: "bar" });
        expect(expression).toEqual([
          "literal",
          { foo: "bar" },
        ] satisfies ExpressionSpecification);
      });
    });

    describe("array", () => {
      it("should create array type assertion", () => {
        const expression = expr.array("string");
        expect(expression).toEqual([
          "array",
          "string",
        ] satisfies ExpressionSpecification);
      });

      it("should create array with length constraint", () => {
        const expression = expr.array("string", 2);
        expect(expression).toEqual([
          "array",
          "string",
          2,
        ] satisfies ExpressionSpecification);
      });

      it("should create array with fallback", () => {
        const expression = expr.array("string", 2, ["a", "b"]);
        expect(expression).toEqual([
          "array",
          "string",
          2,
          ["a", "b"],
        ] satisfies ExpressionSpecification);
      });
    });

    describe("typeof", () => {
      it("should create typeof expression", () => {
        const expression = expr.typeof(["get", "value"]);
        expect(expression).toEqual(
          // @ts-expect-error: MapLibre types are incomplete for typeof
          ["typeof", ["get", "value"]] satisfies ExpressionSpecification
        );
      });
    });

    describe("type assertions", () => {
      it("should create string assertion", () => {
        const expression = expr.string(["get", "name"]);
        expect(expression).toEqual([
          "string",
          ["get", "name"],
        ] satisfies ExpressionSpecification);
      });

      it("should create number assertion", () => {
        const expression = expr.number(["get", "population"]);
        expect(expression).toEqual([
          "number",
          ["get", "population"],
        ] satisfies ExpressionSpecification);
      });

      it("should create boolean assertion", () => {
        const expression = expr.boolean(["get", "isActive"]);
        expect(expression).toEqual([
          "boolean",
          ["get", "isActive"],
        ] satisfies ExpressionSpecification);
      });

      it("should create object assertion", () => {
        const expression = expr.object(["get", "metadata"]);
        expect(expression).toEqual([
          "object",
          ["get", "metadata"],
        ] satisfies ExpressionSpecification);
      });
    });

    describe("collator", () => {
      it("should create collator with options", () => {
        const expression = expr.collator({
          "case-sensitive": true,
          "diacritic-sensitive": true,
          locale: "fr",
        });
        expect(expression).toEqual([
          "collator",
          {
            "case-sensitive": true,
            "diacritic-sensitive": true,
            locale: "fr",
          },
        ] satisfies ExpressionSpecification);
      });
    });

    describe("format", () => {
      it("should create format expression", () => {
        const expression = expr.format(
          ["get", "title"],
          { "font-scale": 1.2 },
          "\n",
          ["get", "description"],
          { "font-scale": 0.8 }
        );
        expect(expression).toEqual([
          "format",
          ["get", "title"],
          { "font-scale": 1.2 },
          "\n",
          ["get", "description"],
          { "font-scale": 0.8 },
        ] satisfies ExpressionSpecification);
      });
    });

    describe("type conversions", () => {
      it("should create toString expression", () => {
        const expression = expr.toString(["get", "value"]);
        expect(expression).toEqual([
          "to-string",
          ["get", "value"],
        ] satisfies ExpressionSpecification);
      });

      it("should create toNumber expression", () => {
        const expression = expr.toNumber(["get", "value"]);
        expect(expression).toEqual([
          "to-number",
          ["get", "value"],
        ] satisfies ExpressionSpecification);
      });

      it("should create toBoolean expression", () => {
        const expression = expr.toBoolean(["get", "value"]);
        expect(expression).toEqual([
          "to-boolean",
          ["get", "value"],
        ] satisfies ExpressionSpecification);
      });

      it("should create toColor expression", () => {
        const expression = expr.toColor("#ff0000");
        expect(expression).toEqual([
          "to-color",
          "#ff0000",
        ] satisfies ExpressionSpecification);
      });
    });
  });

  describe("Evaluation", () => {
    const mockFeature: Feature = {
      type: "Unknown",
      properties: {
        stringValue: "hello",
        numberValue: 42,
        booleanValue: true,
        objectValue: { foo: "bar" },
        arrayValue: ["a", "b", "c"],
        colorValue: "#ff0000",
      },
    };

    describe("type checks", () => {
      it("should evaluate typeof string correctly", () => {
        const expression = expr.typeof(["get", "stringValue"]);
        const result = featureFilter(expr.equal(expression, "string")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should evaluate typeof number correctly", () => {
        const expression = expr.typeof(["get", "numberValue"]);
        const result = featureFilter(expr.equal(expression, "number")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should evaluate typeof boolean correctly", () => {
        const expression = expr.typeof(["get", "booleanValue"]);
        const result = featureFilter(expr.equal(expression, "boolean")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should evaluate typeof object correctly", () => {
        const expression = expr.typeof(["get", "objectValue"]);
        const result = featureFilter(expr.equal(expression, "object")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      // it("should evaluate typeof array correctly", () => {
      //   const expression = expr.typeof(["get", "arrayValue"]);
      //   const result = featureFilter(expr.equal(expression, "array")).filter(
      //     { zoom: 0 },
      //     mockFeature,
      //   );
      //   expect(result).toBe(true);
      // });

      // it("should evaluate typeof array correctly", () => {
      //   const expression = expr.typeof(["get", "arrayValue"]);
      //   const result = featureFilter(
      //     // MapLibre returns "array<string>" for arrays with string elements
      //     expr.equal(expression, "array<string>"),
      //   ).filter({ zoom: 0 }, mockFeature);
      //   expect(result).toBe(true);
      // });

      it("should evaluate typeof null correctly", () => {
        const mockNullFeature: Feature = {
          type: "Unknown",
          properties: { nullValue: null },
        };
        const expression = expr.typeof(["get", "nullValue"]);
        const result = featureFilter(expr.equal(expression, "null")).filter(
          { zoom: 0 },
          mockNullFeature
        );
        expect(result).toBe(true);
      });

      it("should evaluate typeof undefined correctly", () => {
        const expression = expr.typeof(["get", "nonexistentValue"]);
        const result = featureFilter(
          expr.equal(expression, "undefined")
        ).filter({ zoom: 0 }, mockFeature);
        expect(result).toBe(true);
      });
    });

    describe("type assertions", () => {
      it("should assert string type correctly", () => {
        const expression = expr.string(["get", "stringValue"]);
        const result = featureFilter(expr.equal(expression, "hello")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should assert number type correctly", () => {
        const expression = expr.number(["get", "numberValue"]);
        const result = featureFilter(expr.equal(expression, 42)).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should assert boolean type correctly", () => {
        const expression = expr.boolean(["get", "booleanValue"]);
        const result = featureFilter(expression).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should assert object type correctly", () => {
        const expression = expr.object(["get", "objectValue"]);
        const result = featureFilter(
          expr.equal(expr.typeof(expression), "object")
        ).filter({ zoom: 0 }, mockFeature);
        expect(result).toBe(true);
      });

      it("should use fallback for invalid type assertions", () => {
        const expression = expr.string(["get", "numberValue"], "fallback");
        const result = featureFilter(expr.equal(expression, "fallback")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });
    });

    describe("type conversions", () => {
      it("should convert number to string", () => {
        const expression = expr.toString(["get", "numberValue"]);
        const result = featureFilter(expr.equal(expression, "42")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should convert boolean to string", () => {
        const expression = expr.toString(["get", "booleanValue"]);
        const result = featureFilter(expr.equal(expression, "true")).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should convert string to number", () => {
        const mockStringNumberFeature: Feature = {
          type: "Unknown",
          properties: { stringNumber: "42" },
        };
        const expression = expr.toNumber(["get", "stringNumber"]);
        const result = featureFilter(expr.equal(expression, 42)).filter(
          { zoom: 0 },
          mockStringNumberFeature
        );
        expect(result).toBe(true);
      });

      it("should convert boolean to number", () => {
        const expression = expr.toNumber(["get", "booleanValue"]);
        const result = featureFilter(expr.equal(expression, 1)).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should convert string to boolean", () => {
        const expression = expr.toBoolean(["get", "stringValue"]);
        const result = featureFilter(expression).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should convert number to boolean", () => {
        const expression = expr.toBoolean(["get", "numberValue"]);
        const result = featureFilter(expression).filter(
          { zoom: 0 },
          mockFeature
        );
        expect(result).toBe(true);
      });

      it("should convert string to color", () => {
        const expression = expr.toColor(["get", "colorValue"]);
        const result = featureFilter(
          expr.equal(expr.typeof(expression), "color")
        ).filter({ zoom: 0 }, mockFeature);
        expect(result).toBe(true);
      });
    });

    // describe("array assertions", () => {
    //   it("should assert array type correctly", () => {
    //     const expression = expr.array("string");
    //     const result = featureFilter(
    //       expr.equal(expr.typeof(expression), "array"),
    //     ).filter({ zoom: 0 }, mockFeature);
    //     expect(result).toBe(true);
    //   });

    //   it("should assert array length correctly", () => {
    //     const expression = expr.get("arrayValue", expr.array("string", 3));
    //     const result = featureFilter(
    //       expr.equal(expr.typeof(expression), "array"),
    //     ).filter({ zoom: 0 }, mockFeature);
    //     expect(result).toBe(true);
    //   });

    //   it("should use fallback for invalid array", () => {
    //     const expression = expr.array("string", 2, ["fallback"]);
    //     const mockInvalidFeature: Feature = {
    //       type: "Unknown",
    //       properties: { invalidArray: "not an array" },
    //     };
    //     const result = featureFilter(
    //       expr.equal(expr.length(expression), 1),
    //     ).filter({ zoom: 0 }, mockInvalidFeature);
    //     expect(result).toBe(true);
    //   });
    // });
  });
});
