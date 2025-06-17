import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
import { expr } from "../../../src/index"

export interface ExpressionExample {
  name: string
  description: string
  detailedDescription?: string
  expression: ExpressionSpecification
  layerType: "circle" | "fill" | "line" | "symbol"
  paintProperty: string
  defaultValue?: number | string | boolean | null
  useCase?: string
}

export const expressionCategories: Record<string, ExpressionExample[]> = {
  "Math - Arithmetic": [
    {
      name: "add",
      description: "Add two numbers together",
      detailedDescription: "Mathematical addition - useful for offsetting values or combining multiple data points. Here we add 1000 to the population to ensure minimum radius.",
      expression: expr.math.arithmetic.add(expr.lookup.get("population"), 1000),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
      useCase: "Ensuring minimum circle size, combining metrics"
    },
    {
      name: "multiply",
      description: "Multiply values for scaling",
      detailedDescription: "Scale values proportionally - perfect for converting data ranges to visual ranges. This doubles the magnitude for more dramatic visual impact.",
      expression: expr.math.arithmetic.multiply(expr.lookup.get("magnitude"), 2),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
      useCase: "Scaling data to visual ranges, emphasizing differences"
    },
    {
      name: "divide",
      description: "Divide for normalization",
      detailedDescription: "Normalize values to a 0-1 range for opacity. Dividing by 100 converts percentage values to decimal opacity values.",
      expression: expr.math.arithmetic.divide(expr.lookup.get("value"), 100),
      layerType: "circle",
      paintProperty: "circle-opacity",
      defaultValue: 0.5,
      useCase: "Converting percentages to opacity, normalizing data ranges"
    },
    {
      name: "subtract",
      description: "Subtract to find difference",
      detailedDescription: "Calculate differences or create inverse relationships. Here we subtract density from 100 to create an inverse effect.",
      expression: expr.math.arithmetic.subtract(100, expr.lookup.get("density")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
      useCase: "Inverse relationships, calculating differences"
    },
    {
      name: "modulo",
      description: "Modulo for pattern effects",
      detailedDescription: "Create cyclical patterns using remainder operations. This creates 3 distinct opacity levels that repeat based on the data value.",
      expression: expr.math.arithmetic.mod(expr.lookup.get("value"), 3),
      layerType: "circle",
      paintProperty: "circle-opacity",
      defaultValue: 0.5,
      useCase: "Creating repeating visual patterns, categorizing continuous data"
    },
    {
      name: "pow",
      description: "Exponential scaling with power function",
      detailedDescription: "Raise values to a power for non-linear scaling. Using power of 2 creates quadratic growth, emphasizing larger values dramatically.",
      expression: expr.math.arithmetic.pow(expr.lookup.get("value"), 2),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
      useCase: "Non-linear scaling, emphasizing outliers, area-based sizing"
    },
  ],
  "Math - Trigonometry": [
    {
      name: "sin wave pattern",
      description: "Create sine wave based radius",
      detailedDescription: "Generate smooth oscillating patterns using sine function. Perfect for creating rhythmic visual effects that vary with data values.",
      expression: expr.math.arithmetic.add(
        10,
        expr.math.arithmetic.multiply(
          5,
          expr.math.trigonometry.sin(
            expr.math.arithmetic.divide(expr.lookup.get("value"), 10),
          ),
        ),
      ),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 10,
      useCase: "Creating wave-like visual patterns, temporal data visualization"
    },
    {
      name: "cos wave pattern",
      description: "Create cosine wave based opacity",
      detailedDescription: "Use cosine for phase-shifted oscillating patterns. Converts -1 to 1 range to 0 to 1 opacity range.",
      expression: expr.math.arithmetic.divide(
        expr.math.arithmetic.add(
          1,
          expr.math.trigonometry.cos(
            expr.math.arithmetic.divide(expr.lookup.get("density"), 20),
          ),
        ),
        2,
      ),
      layerType: "circle",
      paintProperty: "circle-opacity",
      defaultValue: 0.5,
      useCase: "Phase-shifted patterns, complementary wave effects"
    },
    {
      name: "tan gradient",
      description: "Tangent function for steep transitions",
      detailedDescription: "Creates sharp transitions between values using tangent function. Useful for highlighting threshold areas.",
      expression: expr.math.arithmetic.add(
        5,
        expr.math.trigonometry.tan(
          expr.math.arithmetic.multiply(
            expr.lookup.get("temperature"),
            0.05
          )
        )
      ),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
      useCase: "Sharp transitions, threshold highlighting"
    },
  ],
  "Math - Advanced": [
    {
      name: "abs",
      description: "Absolute value of a number",
      expression: expr.math.advanced.abs(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
    {
      name: "log10",
      description: "Logarithm of a number (base 10)",
      expression: expr.math.advanced.log10(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
    {
      name: "log2",
      description: "Logarithm of a number (base 2)",
      expression: expr.math.advanced.log2(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
    {
      name: "ln",
      description: "Logarithm of a number (base e)",
      expression: expr.math.advanced.ln(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
    {
      name: "sqrt",
      description: "Square root of a number",
      expression: expr.math.advanced.sqrt(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
  ],
  "Math - Constants": [
    {
      name: "pi",
      description: "Pi",
      expression: expr.math.constants.pi(),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
    {
      name: "e",
      description: "Euler's number",
      expression: expr.math.constants.e(),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 0.5,
    },
  ],
  "Decision - Comparison": [
    {
      name: "greater than",
      description: "Check if value is greater than threshold",
      expression: expr.decision.controlFlow.case(
        [[expr.decision.comparison.gt(expr.lookup.get("temperature"), 30), "#ff0000"], [expr.decision.comparison.gt(expr.lookup.get("temperature"), 20), "#ff9900"]],
        "#0099ff",
      ),
      layerType: "circle",
      paintProperty: "circle-color",
      defaultValue: "#0099ff",
    },
    {
      name: "equal",
      description: "Check for exact match",
      expression: expr.decision.controlFlow.case(
        [[expr.decision.comparison.equal(expr.lookup.get("type"), "primary"), "#ff0000"], [expr.decision.comparison.equal(expr.lookup.get("type"), "secondary"), "#00ff00"]],
        "#0000ff",
      ),
      layerType: "fill",
      paintProperty: "fill-color",
      defaultValue: "#0000ff",
    },
    {
      name: "less than or equal",
      description: "Check if value is less than or equal to threshold",
      expression: expr.decision.controlFlow.case(
        [[expr.decision.comparison.lessOrEqual(expr.lookup.get("density"), 30), 0.3], [expr.decision.comparison.lessOrEqual(expr.lookup.get("density"), 60), 0.6]],
        0.9,
      ),
      layerType: "fill",
      paintProperty: "fill-opacity",
      defaultValue: 0.5,
    },
  ],
  "Color": [
    {
      name: "interpolate color",
      description: "Smooth color gradient based on values",
      expression: expr.interpolation.interpolate(
        { type: "linear" },
        expr.lookup.get("density"),
        { input: 0, output: "#ffffff" },
        { input: 50, output: "#ffff00" },
        { input: 100, output: "#ff0000" },
      ),
      layerType: "fill",
      paintProperty: "fill-color",
      defaultValue: "#ffffff",
    },
    {
      name: "rgb",
      description: "Create color from RGB values",
      expression: expr.color.rgb(
        expr.math.arithmetic.multiply(expr.lookup.get("r"), 255),
        expr.math.arithmetic.multiply(expr.lookup.get("g"), 255),
        expr.math.arithmetic.multiply(expr.lookup.get("b"), 255),
      ),
      layerType: "circle",
      paintProperty: "circle-color",
      defaultValue: "#000000",
    },
    {
      name: "rgba with opacity",
      description: "Create color with transparency",
      expression: expr.color.rgba(
        200,
        100,
        50,
        expr.math.arithmetic.divide(expr.lookup.get("density"), 100),
      ),
      layerType: "fill",
      paintProperty: "fill-color",
      defaultValue: "#000000",
    },
  ],
  "Lookup": [
    {
      name: "get property",
      description: "Access feature property value",
      expression: expr.lookup.get("name"),
      layerType: "symbol",
      paintProperty: "text-field",
      defaultValue: "",
    },
    {
      name: "at index",
      description: "Get array value at specific index",
      expression: expr.lookup.at(0, expr.lookup.get("coordinates")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
    },
    {
      name: "has property",
      description: "Check if property exists",
      expression: expr.decision.controlFlow.case(
        [[expr.lookup.has("special"), "#ff0000"]],
        "#0000ff",
      ),
      layerType: "circle",
      paintProperty: "circle-color",
      defaultValue: "#0000ff",
    },
    {
      name: "length of array",
      description: "Get array length",
      expression: expr.lookup.length(expr.lookup.get("coordinates")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
    },
  ],
  "String": [
    {
      name: "concat",
      description: "Combine multiple strings",
      expression: expr.strings.concat(expr.lookup.get("name"), " - ", expr.lookup.get("type")),
      layerType: "symbol",
      paintProperty: "text-field",
      defaultValue: "",
    },
    {
      name: "upcase",
      description: "Convert to uppercase",
      expression: expr.strings.upcase(expr.lookup.get("name")),
      layerType: "symbol",
      paintProperty: "text-field",
      defaultValue: "",
    },
    {
      name: "downcase",
      description: "Convert to lowercase",
      expression: expr.strings.downcase(expr.lookup.get("name")),
      layerType: "symbol",
      paintProperty: "text-field",
      defaultValue: "",
    },
  ],
  "Interpolation": [
    {
      name: "step",
      description: "Discrete steps based on value",
      expression: expr.interpolation.step(
        expr.lookup.get("magnitude"),
        "#00ff00",
        { input: 3, output: "#ffff00" },
        { input: 5, output: "#ff9900" },
        { input: 7, output: "#ff0000" },
      ),
      layerType: "circle",
      paintProperty: "circle-color",
      defaultValue: "#00ff00",
    },
    {
      name: "interpolate linear",
      description: "Smooth linear interpolation",
      expression: expr.interpolation.interpolate(
        { type: "linear" },
        expr.zoom.zoom(),
        { input: 10, output: 1 },
        { input: 15, output: 10 },
        { input: 20, output: 50 },
      ),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
    },
    {
      name: "interpolate exponential",
      description: "Exponential curve interpolation",
      expression: expr.interpolation.interpolate(
        { type: "exponential", base: 2 },
        expr.lookup.get("density"),
        { input: 0, output: 0.1 },
        { input: 100, output: 1 },
      ),
      layerType: "fill",
      paintProperty: "fill-opacity",
      defaultValue: 0.5,
    },
  ],
  "Types": [
    {
      name: "type assertion",
      description: "Assert and check types",
      expression: expr.decision.controlFlow.case(
        [[expr.types.assertion.string(expr.lookup.get("name")), "#00ff00"]],
        "#ff0000",
      ),
      layerType: "circle",
      paintProperty: "circle-color",
      defaultValue: "#ff0000",
    },
    {
      name: "to-number conversion",
      description: "Convert string to number",
      expression: expr.types.conversion.toNumber(expr.lookup.get("value")),
      layerType: "circle",
      paintProperty: "circle-radius",
      defaultValue: 5,
    },
    {
      name: "format number",
      description: "Format number with locale",
      expression: expr.types.formatting.numberFormat(
        expr.lookup.get("population"),
        { locale: "en-US" },
      ),
      layerType: "symbol",
      paintProperty: "text-field",
      defaultValue: "",
    },
  ],
}
