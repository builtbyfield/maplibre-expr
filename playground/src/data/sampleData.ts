import type { FeatureCollection, Point, Polygon } from "geojson"

// Sample point data for testing expressions
export const pointData: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.4, 37.8],
      },
      properties: {
        name: "Location A",
        type: "primary",
        temperature: 25,
        population: 50000,
        magnitude: 4.5,
        value: 75,
        density: 80,
        r: 0.8,
        g: 0.2,
        b: 0.2,
        coordinates: [10, 20, 30],
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.45, 37.85],
      },
      properties: {
        name: "Location B",
        type: "secondary",
        temperature: 35,
        population: 25000,
        magnitude: 6.2,
        value: 120,
        density: 30,
        r: 0.2,
        g: 0.8,
        b: 0.2,
        coordinates: [5, 15, 25],
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.35, 37.75],
      },
      properties: {
        name: "Location C",
        type: "tertiary",
        temperature: 15,
        population: 75000,
        magnitude: 2.1,
        value: 45,
        density: 95,
        r: 0.2,
        g: 0.2,
        b: 0.8,
        coordinates: [15, 25, 35],
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.42, 37.78],
      },
      properties: {
        name: "Location D",
        type: "primary",
        temperature: 22,
        population: 30000,
        magnitude: 7.8,
        value: 200,
        density: 15,
        r: 0.9,
        g: 0.9,
        b: 0.1,
        coordinates: [20, 30, 40],
      },
    },
  ],
}

// Sample polygon data for testing expressions
export const polygonData: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.48, 37.82],
          [-122.48, 37.78],
          [-122.44, 37.78],
          [-122.44, 37.82],
          [-122.48, 37.82],
        ]],
      },
      properties: {
        name: "Zone 1",
        type: "residential",
        density: 45,
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.44, 37.82],
          [-122.44, 37.78],
          [-122.40, 37.78],
          [-122.40, 37.82],
          [-122.44, 37.82],
        ]],
      },
      properties: {
        name: "Zone 2",
        type: "commercial",
        density: 85,
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.40, 37.78],
          [-122.40, 37.74],
          [-122.36, 37.74],
          [-122.36, 37.78],
          [-122.40, 37.78],
        ]],
      },
      properties: {
        name: "Zone 3",
        type: "industrial",
        density: 20,
      },
    },
  ],
}
