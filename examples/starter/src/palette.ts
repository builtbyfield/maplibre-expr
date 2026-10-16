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
  land: "#f4f1ea",
  landcover: "#e6eadb",
  water: "#bcd6e6",
  boundary: "#9a8fa6",
  road: "#ffffff",
  motorway: "#f6d79c",
  building: "#e2ddd3",
  label: "#4a4a4a",
  labelHalo: "#ffffff",
  quakeShallow: "#ffb703",
  quakeMid: "#e85d04",
  quakeDeep: "#6a040f",
  quakeOutline: "#ffffff",
}

export const DARK: Palette = {
  land: "#1d2025",
  landcover: "#22282a",
  water: "#11222f",
  boundary: "#5b5566",
  road: "#30343b",
  motorway: "#5a4a2e",
  building: "#2a2d33",
  label: "#c9ccd1",
  labelHalo: "#1d2025",
  quakeShallow: "#ffd166",
  quakeMid: "#ff7b54",
  quakeDeep: "#d1495b",
  quakeOutline: "#1d2025",
}
