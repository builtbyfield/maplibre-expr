import type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

import type {
  BooleanExpression,
  ExpressionBuilder,
  NumericExpression,
} from "./types"

export class StyleExpressionBuilder implements ExpressionBuilder {
  private expression: ExpressionSpecification

  constructor(initial?: ExpressionSpecification) {
    this.expression = initial ?? ["literal", null]
  }

  public add(...values: NumericExpression[]): this {
    this.expression = ["+", ...values]
    return this
  }

  public when(condition: BooleanExpression): this {
    this.expression = ["case", condition, this.expression]
    return this
  }

  public build(): ExpressionSpecification {
    return this.expression
  }
}
