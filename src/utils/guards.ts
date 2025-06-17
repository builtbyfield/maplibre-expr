import type { Expression } from "@maplibre/maplibre-gl-style-spec"
import { CompoundExpression } from "@maplibre/maplibre-gl-style-spec"

export function isFeatureConstant(e: Expression): boolean {
  if (e instanceof CompoundExpression) {
    if (e.name === "get" && e.args.length === 1) {
      return false
    }
    else if (e.name === "feature-state") {
      return false
    }
    else if (e.name === "has" && e.args.length === 1) {
      return false
    }
    else if (
      e.name === "properties"
      || e.name === "geometry-type"
      || e.name === "id"
    ) {
      return false
    }
    else if (e.name.startsWith("filter-")) {
      return false
    }
  }

  // Check for Within and Distance-like objects by looking for expected properties
  if ("geojson" in e && "geometries" in e) {
    return false
  }

  let result = true
  e.eachChild((arg) => {
    if (result && !isFeatureConstant(arg)) {
      result = false
    }
  })
  return result
}

export function isStateConstant(e: Expression): boolean {
  if (e instanceof CompoundExpression) {
    if (e.name === "feature-state") {
      return false
    }
  }
  let result = true
  e.eachChild((arg) => {
    if (result && !isStateConstant(arg)) {
      result = false
    }
  })
  return result
}

export function isGlobalPropertyConstant(e: Expression, properties: Array<string>): boolean {
  if (e instanceof CompoundExpression && properties.includes(e.name)) {
    return false
  }
  let result = true
  e.eachChild((arg) => {
    if (result && !isGlobalPropertyConstant(arg, properties)) {
      result = false
    }
  })
  return result
}
