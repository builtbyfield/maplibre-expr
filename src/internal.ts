import type { Expr } from "./expr"

/** Builds an expression array, dropping trailing `undefined` arguments. */
export function op<T>(name: string, ...args: unknown[]): Expr<T> {
  let end = args.length
  while (end > 0 && args[end - 1] === undefined)
    end--
  return [name, ...args.slice(0, end)] as unknown as Expr<T>
}

/**
 * Throws for a comparison whose first operand is a string literal and whose
 * second isn't an expression. Such a comparison is constant, and in a filter
 * MapLibre reads it as legacy syntax that compares the *property* of that
 * name, so it means different things in filters and in properties.
 */
export function assertNotLegacyComparison(fn: string, a: unknown, b: unknown): void {
  if (typeof a === "string" && !Array.isArray(b)) {
    throw new RangeError(
      `${fn}(${JSON.stringify(a)}, ${JSON.stringify(b)}) compares two literals. In a filter, MapLibre reads that as legacy syntax `
      + `comparing the property ${JSON.stringify(a)}; elsewhere it's a constant. To compare a property, use get(${JSON.stringify(a)}).`,
    )
  }
}

/** Throws for `match` labels MapLibre rejects: duplicates, non-integer numbers and empty groups. */
export function assertMatchLabels(fn: string, labels: readonly unknown[]): void {
  const seen = new Set<unknown>()
  for (const label of labels) {
    const values = Array.isArray(label) ? label : [label]
    if (values.length === 0)
      throw new RangeError(`${fn}: label groups must not be empty`)
    for (const value of values) {
      if (typeof value === "number" && !Number.isInteger(value))
        throw new RangeError(`${fn}: numeric labels must be integers, got ${value}`)
      if (seen.has(value))
        throw new RangeError(`${fn}: label ${JSON.stringify(value)} appears more than once`)
      seen.add(value)
    }
  }
}

/** Throws for a literal number outside `[min, max]`; expressions are checked by MapLibre at runtime. */
export function assertInRange(fn: string, name: string, value: unknown, min: number, max: number): void {
  if (typeof value === "number" && !(value >= min && value <= max))
    throw new RangeError(`${fn}: ${name} must be between ${min} and ${max}, got ${value}`)
}
