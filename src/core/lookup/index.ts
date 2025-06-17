import type {
  ExpressionInputType,
  ExpressionSpecification,
} from "@maplibre/maplibre-gl-style-spec"

/**
 * Retrieves an item from an array at the specified index.
 *
 * @param index - The index to retrieve from the array
 * @param array - The array to retrieve from
 * @returns An expression that returns the item at the specified index
 *
 * @see [MapLibre Style Specification - at](https://maplibre.org/maplibre-style-spec/expressions/#at)
 *
 * @example
 * expr.at(1, ["literal", ["a", "b", "c"]]); // ["at", 1, ["literal", ["a", "b", "c"]]] -> "b"
 */
export function at(
  index: number | ExpressionSpecification,
  array: ExpressionSpecification,
) {
  return ["at", index, array] satisfies ExpressionSpecification
}

/**
 * Determines whether an item exists in an array or a substring exists in a string.
 *
 * @param needle - The item to search for
 * @param haystack - The array or string to search in
 * @returns An expression that returns true if the item is found
 *
 * @see [MapLibre Style Specification - in](https://maplibre.org/maplibre-style-spec/expressions/#in)
 *
 * @example
 * expr.in_("Point", "$type"); // ["in", "Point", "$type"]
 */
export function in_(
  needle: ExpressionInputType | ExpressionSpecification,
  haystack: ExpressionInputType | ExpressionSpecification,
) {
  return ["in", needle, haystack] satisfies ExpressionSpecification
}

/**
 * Returns the first position at which an item can be found in an array or a substring
 * can be found in a string, or -1 if not found.
 *
 * @param searchElement - The item to search for
 * @param array - The array or string to search in
 * @returns An expression that returns the index of the found item or -1
 *
 * @see [MapLibre Style Specification - index-of](https://maplibre.org/maplibre-style-spec/expressions/#index-of)
 *
 * @example
 * expr.indexOf("foo", ["literal", ["bar", "foo", "baz"]]); // ["index-of", "foo", ["literal", ["bar", "foo", "baz"]]] -> 1
 */
export function indexOf(
  searchElement: ExpressionInputType | ExpressionSpecification,
  array: ExpressionInputType | ExpressionSpecification,
) {
  return ["index-of", searchElement, array] satisfies ExpressionSpecification
}

/**
 * Returns an item from an array or a substring from a string from a specified start index,
 * or between a start index and an end index if set.
 *
 * @param input - The array or string to slice
 * @param start - The start index
 * @param end - Optional end index (exclusive)
 * @returns An expression that returns the sliced array or string
 *
 * @see [MapLibre Style Specification - slice](https://maplibre.org/maplibre-style-spec/expressions/#slice)
 *
 * @example
 * expr.slice(["get", "name"], 0, 3); // ["slice", ["get", "name"], 0, 3]
 */
export function slice(
  input: string | ExpressionSpecification,
  start: number | ExpressionSpecification,
  end?: number | ExpressionSpecification,
) {
  return end !== undefined
    ? (["slice", input, start, end] satisfies ExpressionSpecification)
    : (["slice", input, start] satisfies ExpressionSpecification)
}

/**
 * Retrieves a property value from global state that can be set with
 * platform-specific APIs. Defaults can be provided using the state root
 * property. Returns null if no value nor default value is set for the
 * retrievedproperty.
 *
 * @param property - The name of the property to get
 * @returns An expression that returns the property value
 *
 * @see [MapLibre Style Specification - global-state](https://maplibre.org/maplibre-style-spec/expressions/#global-state)
 *
 * @example
 * expr.globalState("zoom"); // ["global-state", "zoom"]
 */
export function globalState(property: string | ExpressionSpecification) {
  return ["global-state", property] satisfies ExpressionSpecification
}

/**
 * Retrieves a property value from the current feature's properties or from another object
 * if a second argument is provided.
 *
 * @param property - The name of the property to get
 * @param object - Optional object to get the property from
 * @returns An expression that returns the property value
 *
 * @see [MapLibre Style Specification - get](https://maplibre.org/maplibre-style-spec/expressions/#get)
 *
 * @example
 * expr.get("name"); // ["get", "name"]
 * expr.get("population", ["properties"]); // ["get", "population", ["properties"]]
 */
export function get(
  property: string | ExpressionSpecification,
  object?: Record<string, unknown> | ExpressionSpecification,
) {
  return object !== undefined
    ? (["get", property, object] satisfies ExpressionSpecification)
    : (["get", property] satisfies ExpressionSpecification)
}

/**
 * Tests for the presence of a property value in the current feature's properties
 * or in another object if a second argument is provided.
 *
 * @param property - The name of the property to check
 * @param object - Optional object to check the property in
 * @returns An expression that returns true if the property exists
 *
 * @see [MapLibre Style Specification - has](https://maplibre.org/maplibre-style-spec/expressions/#has)
 *
 * @example
 * expr.has("name"); // ["has", "name"]
 * expr.has("population", ["properties"]); // ["has", "population", ["properties"]]
 */
export function has(
  property: string | ExpressionSpecification,
  object?: Record<string, unknown> | ExpressionSpecification,
) {
  return object !== undefined
    ? (["has", property, object] satisfies ExpressionSpecification)
    : (["has", property] satisfies ExpressionSpecification)
}

/**
 * Gets the length of an array or string.
 *
 * @param input - The array or string to get the length of
 * @returns An expression that returns the length
 *
 * @see [MapLibre Style Specification - length](https://maplibre.org/maplibre-style-spec/expressions/#length)
 *
 * @example
 * expr.length(["get", "coordinates"]); // ["length", ["get", "coordinates"]]
 * expr.length("hello"); // ["length", "hello"] -> 5
 */
export function length(input: string | ExpressionSpecification) {
  return ["length", input] satisfies ExpressionSpecification
}

/**
 * Lookup expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Lookup](https://maplibre.org/maplibre-style-spec/expressions/#lookup)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * ```
 */
export const lookup = {
  at,
  in: in_,
  indexOf,
  slice,
  globalState,
  get,
  has,
  length,
} as const
