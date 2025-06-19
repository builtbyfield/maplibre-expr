/**
 * Converts primitive wrapper objects (Number, String, Boolean) to their primitive values.
 * This function handles the conversion of objects created with constructors like `new Number()`,
 * `new String()`, and `new Boolean()` back to their primitive types.
 *
 * @param value - The value to unbundle, which can be any type
 * @returns The unbundled value - if it was a primitive wrapper object, returns the primitive value; otherwise returns the original value unchanged
 *
 * @example
 * ```ts
 * unbundle(new Number(42)) // returns 42 (number)
 * unbundle(new String("hello")) // returns "hello" (string)
 * unbundle(new Boolean(true)) // returns true (boolean)
 * unbundle("plain string") // returns "plain string" (unchanged)
 * unbundle(123) // returns 123 (unchanged)
 * unbundle({ key: "value" }) // returns { key: "value" } (unchanged)
 * ```
 */
export function unbundle(value: unknown): unknown {
  // Check if the value is an object (but not null)
  if (typeof value === "object" && value !== null) {
    // Get the constructor name using Object.prototype.toString
    // This will return "Number", "String", or "Boolean" for wrapper objects
    const type = Object.prototype.toString.call(value).slice(8, -1)

    // If it's a primitive wrapper object, extract the primitive value
    if (type === "Number" || type === "String" || type === "Boolean") {
      return (value as any).valueOf()
    }
  }

  // Return the original value if it's not a primitive wrapper object
  return value
}

/**
 * Recursively unbundles primitive wrapper objects throughout a data structure.
 * This function traverses arrays and objects, converting any primitive wrapper objects
 * (Number, String, Boolean) to their primitive values at any level of nesting.
 *
 * @param value - The value to deep unbundle, which can be any type including nested objects and arrays
 * @returns The deeply unbundled value with all primitive wrapper objects converted to primitives
 *
 * @example
 * ```ts
 * // Simple primitive wrapper objects
 * deepUnbundle(new Number(1)) // returns 1
 * deepUnbundle(new String("test")) // returns "test"
 * deepUnbundle(new Boolean(true)) // returns true
 *
 * // Nested objects
 * deepUnbundle({
 *   a: new Number(1),
 *   b: new String("test"),
 *   c: new Boolean(true)
 * }) // returns { a: 1, b: "test", c: true }
 *
 * // Arrays
 * deepUnbundle([new Number(1), new String("test")]) // returns [1, "test"]
 *
 * // Complex nested structures
 * deepUnbundle({
 *   numbers: [new Number(1), new Number(2)],
 *   nested: { value: new String("deep") }
 * }) // returns { numbers: [1, 2], nested: { value: "deep" } }
 * ```
 */
export function deepUnbundle(value: unknown): unknown {
  // Handle arrays by recursively unbundling each element
  if (Array.isArray(value)) {
    return value.map(deepUnbundle)
  }
  // Handle objects (but not null)
  else if (typeof value === "object" && value !== null) {
    const type = Object.prototype.toString.call(value).slice(8, -1)

    // Only process regular objects, not primitive wrapper objects or built-in objects
    // Primitive wrapper objects and built-in objects will be handled by the unbundle function at the end
    if (type !== "Number" && type !== "String" && type !== "Boolean"
      && type !== "Date" && type !== "RegExp" && type !== "Function") {
      const unbundledValue: { [key: string]: unknown } = {}

      // Recursively unbundle each property of the object
      for (const key in value) {
        unbundledValue[key] = deepUnbundle((value as any)[key])
      }

      return unbundledValue
    }
  }

  // For primitive wrapper objects, built-in objects, or other values, use the basic unbundle function
  return unbundle(value)
}
