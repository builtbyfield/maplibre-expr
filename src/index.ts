// Export core expression categories
export * from "./core/color"
export * from "./core/decision"
export * from "./core/feature-data"
export * from "./core/heatmap"
export * from "./core/interpolation"
export * from "./core/lookup"
export * from "./core/math"
export * from "./core/strings"
export * from "./core/types"
export * from "./core/variables"
export * from "./core/zoom"

// Export custom extensions
export * from "./custom/datetime"

// Core expression categories
import * as color from "./core/color"
import * as decision from "./core/decision"
import * as featureData from "./core/feature-data"
import * as heatmap from "./core/heatmap"
import * as interpolation from "./core/interpolation"
import * as lookup from "./core/lookup"
import * as math from "./core/math"
import * as strings from "./core/strings"
import * as types from "./core/types"
import * as variables from "./core/variables"
import * as zoom from "./core/zoom"

// Custom extensions
import * as datetime from "./custom/datetime"

// Export grouped namespace
export const expr = {
  color,
  decision,
  featureData,
  heatmap,
  interpolation,
  lookup,
  math,
  strings,
  types,
  variables,
  zoom,
  datetime,
}

// Export types
export type { ExpressionSpecification } from "@maplibre/maplibre-gl-style-spec"
