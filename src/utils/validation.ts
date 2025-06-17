import type { Expression } from "@maplibre/maplibre-gl-style-spec"
import { createExpression, createPropertyExpression, ValidationError } from "@maplibre/maplibre-gl-style-spec"
import { isFeatureConstant, isGlobalPropertyConstant, isStateConstant } from "./guards"

export function validateExpression(options: any): Array<ValidationError> {
  const expression = (options.expressionContext === "property" ? createPropertyExpression : createExpression)(deepUnbundle(options.value), options.valueSpec)
  if (expression.result === "error") {
    return expression.value.map((error) => {
      return new ValidationError(`${options.key}${error.key}`, options.value, error.message)
    })
  }

  const expressionObj: Expression = (expression.value as any).expression || (expression.value as any)._styleExpression.expression

  if (options.expressionContext === "property" && (options.propertyKey === "text-font")
    && !expressionObj.outputDefined()) {
    return [new ValidationError(options.key, options.value, `Invalid data expression for "${options.propertyKey}". Output values must be contained as literals within the expression.`)]
  }

  if (options.expressionContext === "property" && options.propertyType === "layout"
    && (!isStateConstant(expressionObj))) {
    return [new ValidationError(options.key, options.value, "\"feature-state\" data expressions are not supported with layout properties.")]
  }

  if (options.expressionContext === "filter" && !isStateConstant(expressionObj)) {
    return [new ValidationError(options.key, options.value, "\"feature-state\" data expressions are not supported with filters.")]
  }

  if (options.expressionContext && options.expressionContext.indexOf("cluster") === 0) {
    if (!isGlobalPropertyConstant(expressionObj, ["zoom", "feature-state"])) {
      return [new ValidationError(options.key, options.value, "\"zoom\" and \"feature-state\" expressions are not supported with cluster properties.")]
    }
    if (options.expressionContext === "cluster-initial" && !isFeatureConstant(expressionObj)) {
      return [new ValidationError(options.key, options.value, "Feature data expressions are not supported with initial expression part of cluster properties.")]
    }
  }

  return []
}

function unbundle(value: unknown): unknown {
  if (typeof value === "object" && value !== null) {
    const type = Object.prototype.toString.call(value).slice(8, -1)
    if (type === "Number" || type === "String" || type === "Boolean") {
      return (value as any).valueOf()
    }
  }
  return value
}

function deepUnbundle(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepUnbundle)
  }
  else if (typeof value === "object" && value !== null) {
    const type = Object.prototype.toString.call(value).slice(8, -1)
    if (type !== "Number" && type !== "String" && type !== "Boolean") {
      const unbundledValue: { [key: string]: unknown } = {}
      for (const key in value) {
        unbundledValue[key] = deepUnbundle((value as any)[key])
      }
      return unbundledValue
    }
  }
  return unbundle(value)
}
