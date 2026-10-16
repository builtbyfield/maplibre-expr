/** Colors for one theme. The style is built from a palette, so dark mode is just a second palette. */
export interface Palette {
  land: string
  landcover: string
  water: string
  boundary: string
  road: string
  motorway: string
  building: string
  label: string
  labelHalo: string
  /** Quake colors from shallow to deep. */
  quakeShallow: string
  quakeMid: string
  quakeDeep: string
  quakeOutline: string
}

export const LIGHT: Palette = {
  land: "#fcfbfb",
  landcover: "#e6f5e6",
  water: "#c9dfea",
  boundary: "#a19d9d",
  road: "#eae7e7",
  motorway: "#d3d0d0",
  building: "#edeaea",
  label: "#484646",
  labelHalo: "#fcfbfb",
  quakeShallow: "#ffb703",
  quakeMid: "#e85d04",
  quakeDeep: "#6a040f",
  quakeOutline: "#ffffff",
}

export const DARK: Palette = {
  land: "#2f2d2d",
  landcover: "#2a332c",
  water: "#132029",
  boundary: "#605d5d",
  road: "#3f3c3c",
  motorway: "#4f4c4c",
  building: "#3c3a3a",
  label: "#d2d0d0",
  labelHalo: "#2f2d2d",
  quakeShallow: "#ffd166",
  quakeMid: "#ff7b54",
  quakeDeep: "#d1495b",
  quakeOutline: "#2f2d2d",
}
