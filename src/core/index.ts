import * as color from "./color"
import * as decision from "./decision"
import * as featureData from "./feature-data"
import * as heatmap from "./heatmap"
import * as interpolation from "./interpolation"
import * as lookup from "./lookup"
import * as math from "./math"
import * as strings from "./strings"
import * as types from "./types"
import * as variables from "./variables"
import * as zoom from "./zoom"

/**
 * Core expressions for MapLibre Style Specification.
 *
 * Direct access to all expressions is available via the `expr` object (e.g.
 * `expr.round(1.5)`); however, you can also access expressions via sub-objects
 * for each category (e.g. `expr.math.round(1.5)`) or sub-category (e.g.
 * `expr.math.rounding.round(1.5)`) if applicable.
 *
 * @see [MapLibre Style Specification - Expressions](https://maplibre.org/maplibre-style-spec/expressions/)
 *
 * @example
 * ```ts
 * import { expr } from '@builtbyfield/maplibre-expression-helpers'
 *
 * // Direct access
 * expr.round(1.5); // ["round", 1.5]
 * // Access via math
 * expr.math.round(1.5); // ["round", 1.5]
 * // Access via math.rounding
 * expr.math.rounding.round(1.5); // ["round", 1.5]
 * ```
 */
export const core = {
  ...color,
  ...decision,
  ...featureData,
  ...heatmap,
  ...interpolation,
  ...lookup,
  ...math,
  ...strings,
  ...types,
  ...variables,
  ...zoom,
}

export default core
