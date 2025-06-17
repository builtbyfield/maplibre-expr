import type { FeatureCollection, Point, Polygon } from "geojson"

// Helper to create realistic timestamps
const now = Date.now()
const oneHour = 60 * 60 * 1000
const oneDay = 24 * oneHour
const oneWeek = 7 * oneDay

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
        // DateTime properties
        lastUpdate: now - (2 * oneHour), // 2 hours ago
        lastActivity: now - (30 * 60 * 1000), // 30 minutes ago
        eventStart: now - oneHour, // Started 1 hour ago
        eventEnd: now + (2 * oneHour), // Ends in 2 hours (currently active)
        scheduledDate: now + (3 * oneDay), // In 3 days
        deadline: now + (2 * oneDay), // Deadline in 2 days
        createdAt: now - (5 * oneDay), // Created 5 days ago
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
        // DateTime properties - different patterns for variety
        lastUpdate: now, // Just updated (should show as "today")
        lastActivity: now - (10 * oneDay), // 10 days ago (old activity)
        eventStart: now + oneDay, // Tomorrow
        eventEnd: now + (3 * oneDay), // Multi-day event ending in 3 days
        scheduledDate: now + (10 * oneDay), // In 10 days (not in next 7 days)
        deadline: now - oneDay, // Deadline was yesterday (overdue)
        createdAt: now - (2 * oneWeek), // Created 2 weeks ago
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
        // DateTime properties - single day event
        lastUpdate: now - (6 * oneHour), // 6 hours ago
        lastActivity: now - (15 * 60 * 1000), // 15 minutes ago (very recent)
        eventStart: now + (4 * oneHour), // Starts in 4 hours
        eventEnd: now + (8 * oneHour), // Same day event (4 hour duration)
        scheduledDate: now + (5 * oneDay), // In 5 days (within next 7)
        deadline: now + oneHour, // Urgent! Deadline in 1 hour
        createdAt: now - oneWeek, // Created 1 week ago
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
        // DateTime properties - past event
        lastUpdate: now - (3 * oneWeek), // 3 weeks ago (old data)
        lastActivity: now - (5 * oneDay), // 5 days ago
        eventStart: now - (2 * oneDay), // Started 2 days ago
        eventEnd: now - oneDay, // Ended yesterday (completed event)
        scheduledDate: now - oneWeek, // Was scheduled for last week
        deadline: now + (6 * oneDay), // Deadline in 6 days (within next 7)
        createdAt: now - (4 * oneWeek), // Created 1 month ago
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
        // DateTime properties for zones
        lastUpdate: now - (12 * oneHour), // 12 hours ago
        lastActivity: now - (3 * oneHour), // 3 hours ago
        eventStart: now - (6 * oneHour), // Event started 6 hours ago
        eventEnd: now + (6 * oneHour), // Event continues for 6 more hours
        scheduledDate: now + (2 * oneDay), // Scheduled maintenance in 2 days
        deadline: now + (4 * oneDay), // Project deadline in 4 days
        createdAt: now - (30 * oneDay), // Zone established 30 days ago
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
        // DateTime properties
        lastUpdate: now, // Just updated
        lastActivity: now - (45 * 60 * 1000), // 45 minutes ago
        eventStart: now + (2 * oneHour), // Event in 2 hours
        eventEnd: now + (2 * oneHour) + (30 * 60 * 1000), // 30-minute event
        scheduledDate: now + oneDay, // Tomorrow's business event
        deadline: now + (8 * oneDay), // Permit deadline in 8 days
        createdAt: now - (60 * oneDay), // Commercial zone for 60 days
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
        // DateTime properties
        lastUpdate: now - (2 * oneDay), // 2 days ago
        lastActivity: now - (7 * oneDay), // 1 week ago (inactive)
        eventStart: now - oneWeek, // Past maintenance event
        eventEnd: now - (oneWeek - oneDay), // Ended 6 days ago
        scheduledDate: now + (14 * oneDay), // Next inspection in 2 weeks
        deadline: now + (3 * oneDay), // Environmental report due in 3 days
        createdAt: now - (90 * oneDay), // Industrial zone for 90 days
      },
    },
  ],
}
