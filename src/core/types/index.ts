import * as assertion from "./assertion";
import * as conversion from "./conversion";
import * as formatting from "./formatting";

export * from "./assertion";
export * from "./conversion";
export * from "./formatting";

/**
 * Type expressions for MapLibre Style Specification.
 *
 * @see [MapLibre Style Specification - Types](https://maplibre.org/maplibre-style-spec/expressions/#types)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * expr.string(["get", "name"]); // ["string", ["get", "name"]]
 * ```
 */
export const types = {
  ...assertion,
  ...conversion,
  ...formatting,
} as const;
