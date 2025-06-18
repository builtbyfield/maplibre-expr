import * as datetime from "./datetime"
import * as validation from "./validation"
import * as statistics from "./statistics"
import * as geospatial from "./geospatial"
import * as text from "./text"
import * as colorUtils from "./color-utils"
import * as business from "./business"
import * as transform from "./transform"
import * as styling from "./styling"
import * as units from "./units"

/**
 * Custom expressions for MapLibre Style Specification.
 * These are high-level helpers that compose core expressions
 * to solve common real-world problems.
 */
export const custom = {
  ...datetime,
  ...validation,
  ...statistics,
  ...geospatial,
  ...text,
  ...colorUtils,
  ...business,
  ...transform,
  ...styling,
  ...units,
}

// Also export individual modules for targeted imports
export {
  datetime,
  validation,
  statistics,
  geospatial,
  text,
  colorUtils,
  business,
  transform,
  styling,
  units,
}

export default custom
