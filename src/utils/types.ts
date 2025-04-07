import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec";

export type NumericExpression = number | ExpressionSpecification;
export type StringExpression = string | ExpressionSpecification;
export type BooleanExpression = boolean | ExpressionSpecification;
export type ColorExpression = string | ExpressionSpecification;

export interface ExpressionBuilder {
  // Math
  add: (...values: NumericExpression[]) => ExpressionSpecification;
  subtract: (...values: NumericExpression[]) => ExpressionSpecification;
  multiply: (...values: NumericExpression[]) => ExpressionSpecification;
  divide: (
    value1: NumericExpression,
    value2: NumericExpression
  ) => ExpressionSpecification;

  // Lookup
  get: (key: string, obj?: ExpressionSpecification) => ExpressionSpecification;
  has: (key: string, obj?: ExpressionSpecification) => ExpressionSpecification;

  // ... other expression types
}
