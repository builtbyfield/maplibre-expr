import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

export type NumericExpression = number | ExpressionSpecification
export type StringExpression = string | ExpressionSpecification
export type BooleanExpression = boolean | ExpressionSpecification
export type ColorExpression = string | ExpressionSpecification
export type UnknownExpression = unknown | ExpressionSpecification
