import type { ExpressionInputType, ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"

interface VariableBinding {
  name: string
  value: ExpressionInputType | ExpressionSpecification
}

/**
 * Binds expressions to named variables, which can then be referenced in the
 * result expression using `["var", "variable_name"]`.
 *
 * @param bindings - Array of [variable_name, expression] pairs
 * @param result - The result expression that can reference the variables
 * @returns An expression that evaluates with the bound variables
 *
 * @see [MapLibre Style Specification - let](https://maplibre.org/maplibre-style-spec/expressions/#let)
 *
 * @example
 * ```ts
 * // Define variables and use them
 * expr.variables.let(
 *   [
 *     ["base", ["get", "population"]],
 *     ["ratio", ["/", ["var", "base"], 1000]]
 *   ],
 *   ["*", ["var", "ratio"], 10]
 * ); // ["let", "base", ["get", "population"], "ratio", ["/", ["var", "base"], 1000], ["*", ["var", "ratio"], 10]]
 * ```
 */
export function let_(
  bindings: VariableBinding[],
  result: ExpressionSpecification,
): ExpressionSpecification {
  const firstBinding = bindings[0]
  const restBindings = bindings.slice(1)

  return [
    "let",
    firstBinding.name,
    firstBinding.value,
    ...restBindings.flatMap(binding => [binding.name, binding.value]),
    result,
  ] satisfies ExpressionSpecification
}

/**
 * References a variable bound using `let`.
 *
 * @param variableName - The name of the variable to reference
 * @returns An expression that references the variable
 *
 * @see [MapLibre Style Specification - var](https://maplibre.org/maplibre-style-spec/expressions/#var)
 *
 * @example
 * ```ts
 * // Reference a variable (typically used within a let expression)
 * expr.variables.var("myVariable"); // ["var", "myVariable"]
 * ```
 */
export function var_(variableName: string) {
  return ["var", variableName] satisfies ExpressionSpecification
}

/**
 * Variable expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Variables](https://maplibre.org/maplibre-style-spec/expressions/#variables)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Define and use variables
 * expr.variables.let(
 *   [
 *     ["base", ["get", "population"]],
 *     ["ratio", ["/", ["var", "base"], 1000]]
 *   ],
 *   ["*", ["var", "ratio"], 10]
 * ); // ["let", "base", ["get", "population"], "ratio", ["/", ["var", "base"], 1000], ["*", ["var", "ratio"], 10]]
 * ```
 */
export const variables = {
  let: let_,
  var: var_,
} as const
