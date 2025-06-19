import type { Expression, StylePropertySpecification } from "@maplibre/maplibre-gl-style-spec"

import { createExpression, createPropertyExpression, ValidationError } from "@maplibre/maplibre-gl-style-spec"

import { isFeatureConstant, isGlobalPropertyConstant, isStateConstant } from "./guards"
import { deepUnbundle } from "./unbundle"

/**
 * Base options for expression validation.
 *
 * This interface defines the common properties needed for validating MapLibre GL expressions
 * that retrieve and manipulate data across different contexts (property, filter, cluster, etc.).
 * The validation ensures that data retrieval patterns like `["get", "property"]`,
 * `["feature-state", "state"]`, and `["zoom"]` are used appropriately.
 */
interface ValidationOptions {
  /**
   * The context in which the expression is being validated.
   *
   * - `"property"`: Validating a style property expression (e.g., paint or layout property)
   *   - Allows feature property retrieval: `["get", "propertyName"]`
   *   - Restricts feature-state in layout properties
   *   - Requires literal output for text-font properties
   * - `"filter"`: Validating a filter expression for layer filtering
   *   - Allows feature property retrieval and comparison
   *   - Blocks feature-state expressions (evaluated at parse time)
   * - `"cluster"`: Validating a cluster property expression
   *   - Allows cluster property retrieval: `["get", "point_count"]`
   *   - Blocks zoom and feature-state expressions
   * - `"cluster-initial"`: Validating the initial part of a cluster property expression
   *   - Requires feature-constant expressions (no per-feature data retrieval)
   */
  expressionContext?: "property" | "filter" | "cluster" | "cluster-initial"

  /**
   * The expression value to validate.
   * This can be a raw expression array, object, or primitive value.
   * Common patterns include:
   * - `["get", "propertyName"]` - feature property retrieval
   * - `["feature-state", "stateName"]` - feature state retrieval
   * - `["zoom"]` - zoom level retrieval
   * - `["+", ["get", "count"], 1]` - combined data retrieval and manipulation
   */
  value: unknown

  /**
   * The key used for error reporting.
   * This is typically the property name or identifier where the expression is used.
   * Examples: "paint.fill-color", "layout.text-font", "filter", "cluster-count"
   */
  key: string

  /**
   * The property key being validated (e.g., "text-font", "fill-color").
   * Used for context-specific validation rules, especially for properties
   * that have special requirements for data retrieval patterns.
   */
  propertyKey?: string

  /**
   * The property type (e.g., "layout", "paint").
   * Used to determine which validation rules apply, particularly for
   * feature-state expression restrictions in layout properties.
   */
  propertyType?: string
}

/**
 * Validation options specifically for property expressions.
 *
 * Property expressions require a value specification to validate against
 * the expected data type and constraints.
 */
interface ValidationOptionsWithProperty extends ValidationOptions {
  /** Must be "property" for this interface */
  expressionContext: "property"

  /**
   * The style property specification for validation.
   * Required for property context to validate against expected data types.
   *
   * @example
   * ```typescript
   * {
   *   type: "color",
   *   default: "#000000",
   *   transition: true
   * }
   * ```
   */
  valueSpec: StylePropertySpecification
}

/**
 * Validation options for non-property expressions (filters, clusters).
 *
 * These contexts don't always require a value specification,
 * but one can be provided for additional validation.
 */
interface ValidationOptionsWithoutProperty extends ValidationOptions {
  /** Can be "filter", "cluster", "cluster-initial", or undefined */
  expressionContext?: "filter" | "cluster" | "cluster-initial"

  /**
   * The style property specification for validation (optional).
   * Can be provided for additional validation but is not required.
   */
  valueSpec?: StylePropertySpecification
}

/**
 * Union type for all validation options.
 *
 * This allows the function to accept either property-specific options
 * or general validation options while maintaining type safety.
 */
type ValidationOptionsUnion = ValidationOptionsWithProperty | ValidationOptionsWithoutProperty

/**
 * Validates MapLibre GL expressions with a focus on data retrieval patterns.
 *
 * This function performs comprehensive validation of expressions that retrieve and manipulate data,
 * including feature properties, feature-state, zoom levels, and cluster properties. It ensures
 * that data retrieval expressions are used appropriately in different contexts.
 *
 * **Key validation areas:**
 * - **Feature property retrieval**: `["get", "propertyName"]` expressions
 * - **Feature-state retrieval**: `["feature-state", "stateName"]` expressions (with context restrictions)
 * - **Zoom level retrieval**: `["zoom"]` expressions (with context restrictions)
 * - **Cluster property retrieval**: `["get", "point_count"]` and similar cluster expressions
 * - **Complex retrieval patterns**: Conditional, interpolated, and combined data retrieval
 *
 * **Context-specific validation rules:**
 * - **Property expressions**: Validates paint/layout properties with type constraints
 * - **Filter expressions**: Ensures feature-state is not used (evaluated at parse time)
 * - **Cluster expressions**: Restricts zoom and feature-state usage
 * - **Text-font properties**: Requires literal output for performance
 *
 * @param options - The validation options containing context, value, and constraints
 * @returns An array of ValidationError objects. Empty array means validation passed.
 *
 * @example
 * ```typescript
 * // Validate feature property retrieval in a paint property
 * const errors = validateExpression({
 *   expressionContext: "property",
 *   value: ["get", "population"],  // Retrieving feature property
 *   key: "circle-radius",
 *   propertyKey: "circle-radius",
 *   propertyType: "paint",
 *   valueSpec: {
 *     type: "number",
 *     default: 5,
 *     minimum: 0
 *   }
 * });
 *
 * if (errors.length > 0) {
 *   console.error("Validation errors:", errors);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Validate feature property retrieval in a filter
 * const errors = validateExpression({
 *   expressionContext: "filter",
 *   value: ["==", ["get", "type"], "restaurant"],  // Retrieving and comparing feature property
 *   key: "filter"
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Validate cluster property retrieval
 * const errors = validateExpression({
 *   expressionContext: "cluster",
 *   value: ["+", ["get", "point_count"], 1],  // Retrieving and manipulating cluster property
 *   key: "cluster-count"
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Validate complex conditional data retrieval
 * const errors = validateExpression({
 *   expressionContext: "property",
 *   value: [
 *     "case",
 *     [">", ["get", "population"], 1000000],  // Retrieve population, compare
 *     "#ff0000",
 *     [">", ["get", "population"], 100000],   // Retrieve population again
 *     "#ff9900",
 *     "#0099ff"
 *   ],
 *   key: "fill-color",
 *   propertyType: "paint",
 *   valueSpec: { type: "color", default: "#000000" }
 * });
 * ```
 */
export function validateExpression(options: ValidationOptionsUnion): Array<ValidationError> {
  // Create the appropriate expression validator based on context
  const expression = options.expressionContext === "property"
    ? createPropertyExpression(deepUnbundle(options.value), options.valueSpec)
    : createExpression(deepUnbundle(options.value), options.valueSpec || null)

  // If the expression creation failed, return the validation errors
  if (expression.result === "error") {
    return expression.value.map((error) => {
      return new ValidationError(`${options.key}${error.key}`, options.value, error.message)
    })
  }

  // Extract the expression object for further validation
  // The expression can be either a direct expression or wrapped in a style expression
  const expressionObj: Expression = (expression.value as any).expression || (expression.value as any)._styleExpression.expression

  // Special validation for text-font property: output must be defined
  // This ensures that text-font expressions can be evaluated at parse time
  if (options.expressionContext === "property" && (options.propertyKey === "text-font")
    && !expressionObj.outputDefined()) {
    return [new ValidationError(options.key, options.value, `Invalid data expression for "${options.propertyKey}". Output values must be contained as literals within the expression.`)]
  }

  // Layout properties don't support feature-state expressions
  // Feature-state is only available for paint properties
  if (options.expressionContext === "property" && options.propertyType === "layout"
    && (!isStateConstant(expressionObj))) {
    return [new ValidationError(options.key, options.value, "\"feature-state\" data expressions are not supported with layout properties.")]
  }

  // Filter expressions don't support feature-state expressions
  // Filters are evaluated at parse time, before feature-state is available
  if (options.expressionContext === "filter" && !isStateConstant(expressionObj)) {
    return [new ValidationError(options.key, options.value, "\"feature-state\" data expressions are not supported with filters.")]
  }

  // Cluster property validation
  if (options.expressionContext && options.expressionContext.indexOf("cluster") === 0) {
    // Cluster properties don't support zoom or feature-state expressions
    // They are evaluated once per cluster, not per feature or zoom level
    if (!isGlobalPropertyConstant(expressionObj, ["zoom", "feature-state"])) {
      return [new ValidationError(options.key, options.value, "\"zoom\" and \"feature-state\" expressions are not supported with cluster properties.")]
    }

    // Initial cluster expressions must be feature-constant
    // They are evaluated once per cluster, not per feature within the cluster
    if (options.expressionContext === "cluster-initial" && !isFeatureConstant(expressionObj)) {
      return [new ValidationError(options.key, options.value, "Feature data expressions are not supported with initial expression part of cluster properties.")]
    }
  }

  // If we reach here, validation passed
  return []
}
