import type { FeatureCollection, Point, Polygon } from "geojson"

// Helper to create realistic timestamps
const now = Date.now()
const oneMinute = 60 * 1000
const oneHour = 60 * oneMinute
const oneDay = 24 * oneHour
const oneWeek = 7 * oneDay

// Helper functions for generating varied data
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

// Location and facility types for realistic naming
const locationTypes = ['Hospital', 'School', 'Park', 'Library', 'Station', 'Center', 'Plaza', 'Tower', 'Mall', 'Port']
const facilityTypes = ['primary', 'secondary', 'tertiary', 'emergency', 'public', 'private', 'municipal', 'federal']
const statusTypes = ['active', 'inactive', 'maintenance', 'planned', 'emergency', 'closed']

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
        id: "point-001",
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
        id: "point-002",
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
        id: "point-003",
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
        id: "point-004",
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
    // Generate many more varied point features
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.38, 37.82],
      },
      properties: {
        id: "point-005",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties
        lastUpdate: now - randomInRange(0, 7 * oneDay),
        lastActivity: now - randomInRange(0, 3 * oneDay),
        eventStart: now - randomInRange(-2 * oneDay, 2 * oneDay),
        eventEnd: now + randomInRange(0, 5 * oneDay),
        scheduledDate: now + randomInRange(0, 14 * oneDay),
        deadline: now + randomInRange(-1 * oneDay, 10 * oneDay),
        createdAt: now - randomInRange(1 * oneDay, 90 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.47, 37.73],
      },
      properties: {
        id: "point-006",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - emergency scenario
        lastUpdate: now - (5 * 60 * 1000), // 5 minutes ago
        lastActivity: now - (2 * 60 * 1000), // 2 minutes ago (very active)
        eventStart: now - (30 * 60 * 1000), // Started 30 minutes ago
        eventEnd: now + (4 * oneHour), // Emergency response - 4 hours
        scheduledDate: now + (24 * oneHour), // Tomorrow's follow-up
        deadline: now + (2 * oneHour), // Critical deadline
        createdAt: now - (45 * 60 * 1000), // Created 45 minutes ago
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.33, 37.87],
      },
      properties: {
        id: "point-007",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - future event
        lastUpdate: now - (3 * oneDay),
        lastActivity: now - (2 * oneWeek),
        eventStart: now + (3 * oneDay), // Future event
        eventEnd: now + (4 * oneDay),
        scheduledDate: now + (3 * oneDay),
        deadline: now + (7 * oneDay),
        createdAt: now - (2 * oneWeek),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.41, 37.71],
      },
      properties: {
        id: "point-008",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - overdue scenario
        lastUpdate: now - (14 * oneDay), // 2 weeks old data
        lastActivity: now - (21 * oneDay), // 3 weeks inactive
        eventStart: now - (10 * oneDay), // Past event
        eventEnd: now - (9 * oneDay),
        scheduledDate: now - (5 * oneDay), // Was scheduled 5 days ago
        deadline: now - (3 * oneDay), // Overdue by 3 days
        createdAt: now - (30 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.46, 37.89],
      },
      properties: {
        id: "point-009",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - recurring event pattern
        lastUpdate: now - (12 * oneHour),
        lastActivity: now - (6 * oneHour),
        eventStart: now + (1 * oneHour), // Starts soon
        eventEnd: now + (3 * oneHour),
        scheduledDate: now + (7 * oneDay), // Weekly recurring
        deadline: now + (5 * oneDay),
        createdAt: now - (60 * oneDay), // Long-established
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.37, 37.69],
      },
      properties: {
        id: "point-010",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - maintenance window
        lastUpdate: now,
        lastActivity: now - (8 * oneHour),
        eventStart: now + (2 * oneDay), // Scheduled maintenance
        eventEnd: now + (2 * oneDay) + (4 * oneHour), // 4-hour window
        scheduledDate: now + (2 * oneDay),
        deadline: now + (30 * oneDay), // Monthly deadline
        createdAt: now - (15 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.44, 37.91],
      },
      properties: {
        id: "point-011",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - multi-day event
        lastUpdate: now - (1 * oneDay),
        lastActivity: now - (4 * oneHour),
        eventStart: now - (1 * oneDay), // Started yesterday
        eventEnd: now + (2 * oneDay), // Ends day after tomorrow
        scheduledDate: now - (1 * oneDay),
        deadline: now + (14 * oneDay), // Biweekly deadline
        createdAt: now - (45 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.39, 37.77],
      },
      properties: {
        id: "point-012",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - just updated
        lastUpdate: now,
        lastActivity: now - (15 * 60 * 1000), // 15 minutes ago
        eventStart: now + (6 * oneHour), // This evening
        eventEnd: now + (10 * oneHour),
        scheduledDate: now + (1 * oneDay),
        deadline: now + (3 * oneDay),
        createdAt: now - (7 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.43, 37.84],
      },
      properties: {
        id: "point-013",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - weekend event
        lastUpdate: now - (2 * oneDay),
        lastActivity: now - (18 * oneHour),
        eventStart: now + (5 * oneDay), // Next weekend
        eventEnd: now + (6 * oneDay),
        scheduledDate: now + (5 * oneDay),
        deadline: now + (21 * oneDay), // 3 weeks out
        createdAt: now - (10 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.36, 37.83],
      },
      properties: {
        id: "point-014",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - long-term project
        lastUpdate: now - (5 * oneDay),
        lastActivity: now - (10 * oneDay),
        eventStart: now + (30 * oneDay), // Next month
        eventEnd: now + (90 * oneDay), // 3-month project
        scheduledDate: now + (30 * oneDay),
        deadline: now + (120 * oneDay), // 4-month deadline
        createdAt: now - (20 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.48, 37.86],
      },
      properties: {
        id: "point-015",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - daily recurring
        lastUpdate: now - (1 * oneHour),
        lastActivity: now - (30 * 60 * 1000),
        eventStart: now + (12 * oneHour), // Tomorrow same time
        eventEnd: now + (14 * oneHour),
        scheduledDate: now + (1 * oneDay), // Daily schedule
        deadline: now + (1 * oneDay),
        createdAt: now - (3 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.34, 37.72],
      },
      properties: {
        id: "point-016",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - historical data
        lastUpdate: now - (30 * oneDay),
        lastActivity: now - (45 * oneDay),
        eventStart: now - (60 * oneDay), // 2 months ago
        eventEnd: now - (58 * oneDay),
        scheduledDate: now - (60 * oneDay),
        deadline: now - (55 * oneDay), // Past deadline
        createdAt: now - (90 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.45, 37.74],
      },
      properties: {
        id: "point-017",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - short-term event
        lastUpdate: now - (2 * oneHour),
        lastActivity: now - (45 * 60 * 1000),
        eventStart: now + (3 * oneHour), // This afternoon
        eventEnd: now + (4 * oneHour), // 1-hour event
        scheduledDate: now + (3 * oneHour),
        deadline: now + (6 * oneHour), // Due this evening
        createdAt: now - (2 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-122.40, 37.88],
      },
      properties: {
        id: "point-018",
        name: randomChoice(locationTypes) + " " + randomChoice(facilityTypes),
        type: randomChoice(facilityTypes),
        temperature: randomInRange(10, 40),
        population: Math.floor(randomInRange(5000, 100000)),
        magnitude: randomInRange(1.0, 9.0),
        value: Math.floor(randomInRange(10, 300)),
        density: Math.floor(randomInRange(5, 100)),
        r: randomInRange(0.1, 1.0),
        g: randomInRange(0.1, 1.0),
        b: randomInRange(0.1, 1.0),
        coordinates: [randomInRange(0, 50), randomInRange(0, 50), randomInRange(0, 50)],
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high', 'critical']),
        category: randomChoice(['medical', 'education', 'transport', 'recreation', 'commercial']),
        // DateTime properties - seasonal event
        lastUpdate: now - (7 * oneDay),
        lastActivity: now - (14 * oneDay),
        eventStart: now + (90 * oneDay), // Seasonal (3 months)
        eventEnd: now + (120 * oneDay),
        scheduledDate: now + (90 * oneDay),
        deadline: now + (60 * oneDay), // 2 months to prepare
        createdAt: now - (30 * oneDay),
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
        id: "polygon-001",
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
        id: "polygon-002",
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
        id: "polygon-003",
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
    // Additional polygon zones with varied properties
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.42, 37.70],
          [-122.42, 37.68],
          [-122.38, 37.68],
          [-122.38, 37.70],
          [-122.42, 37.70],
        ]],
      },
      properties: {
        id: "polygon-004",
        name: "Mixed Use District",
        type: "mixed-use",
        density: randomInRange(40, 80),
        population: Math.floor(randomInRange(10000, 50000)),
        value: Math.floor(randomInRange(50, 200)),
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium', 'high']),
        category: randomChoice(['development', 'residential', 'commercial']),
        // DateTime properties
        lastUpdate: now - (6 * oneHour),
        lastActivity: now - (2 * oneDay),
        eventStart: now + (1 * oneDay), // Event tomorrow
        eventEnd: now + (3 * oneDay),
        scheduledDate: now + (2 * oneDay),
        deadline: now + (10 * oneDay),
        createdAt: now - (45 * oneDay),
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.36, 37.85],
          [-122.36, 37.83],
          [-122.32, 37.83],
          [-122.32, 37.85],
          [-122.36, 37.85],
        ]],
      },
      properties: {
        id: "polygon-005",
        name: "Green Space",
        type: "park",
        density: randomInRange(5, 25),
        population: Math.floor(randomInRange(0, 5000)), // Visitors count
        value: Math.floor(randomInRange(20, 100)),
        status: randomChoice(statusTypes),
        urgency: randomChoice(['low', 'medium']),
        category: 'recreation',
        // DateTime properties - park maintenance
        lastUpdate: now - (3 * oneDay),
        lastActivity: now - (12 * oneHour),
        eventStart: now + (7 * oneDay), // Weekly maintenance
        eventEnd: now + (7 * oneDay) + (3 * oneHour),
        scheduledDate: now + (7 * oneDay),
        deadline: now + (14 * oneDay),
        createdAt: now - (120 * oneDay), // Well-established park
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.49, 37.75],
          [-122.49, 37.72],
          [-122.45, 37.72],
          [-122.45, 37.75],
          [-122.49, 37.75],
        ]],
      },
      properties: {
        id: "polygon-006",
        name: "Technology Campus",
        type: "tech",
        density: randomInRange(60, 95),
        population: Math.floor(randomInRange(5000, 25000)),
        value: Math.floor(randomInRange(150, 400)),
        status: randomChoice(statusTypes),
        urgency: randomChoice(['medium', 'high']),
        category: 'commercial',
        // DateTime properties - active tech campus
        lastUpdate: now - (30 * 60 * 1000), // 30 minutes ago
        lastActivity: now - (10 * 60 * 1000), // 10 minutes ago
        eventStart: now + (4 * oneHour), // Daily standup
        eventEnd: now + (5 * oneHour),
        scheduledDate: now + (1 * oneDay), // Daily recurring
        deadline: now + (2 * oneDay), // Sprint deadline
        createdAt: now - (180 * oneDay), // 6-month old campus
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.35, 37.90],
          [-122.35, 37.88],
          [-122.31, 37.88],
          [-122.31, 37.90],
          [-122.35, 37.90],
        ]],
      },
      properties: {
        id: "polygon-007",
        name: "Historic District",
        type: "historic",
        density: randomInRange(30, 60),
        population: Math.floor(randomInRange(2000, 15000)),
        value: Math.floor(randomInRange(80, 250)),
        status: randomChoice(['active', 'maintenance']),
        urgency: randomChoice(['low', 'medium']),
        category: 'cultural',
        // DateTime properties - preservation project
        lastUpdate: now - (1 * oneWeek),
        lastActivity: now - (3 * oneDay),
        eventStart: now + (14 * oneDay), // Restoration event
        eventEnd: now + (45 * oneDay), // Month-long project
        scheduledDate: now + (14 * oneDay),
        deadline: now + (60 * oneDay), // 2-month deadline
        createdAt: now - (365 * oneDay), // Historic designation 1 year ago
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.47, 37.93],
          [-122.47, 37.91],
          [-122.43, 37.91],
          [-122.43, 37.93],
          [-122.47, 37.93],
        ]],
      },
      properties: {
        id: "polygon-008",
        name: "Waterfront Development",
        type: "waterfront",
        density: randomInRange(25, 50),
        population: Math.floor(randomInRange(3000, 12000)),
        value: Math.floor(randomInRange(200, 500)),
        status: randomChoice(['planned', 'active']),
        urgency: randomChoice(['medium', 'high']),
        category: 'development',
        // DateTime properties - future development
        lastUpdate: now - (2 * oneDay),
        lastActivity: now - (5 * oneDay),
        eventStart: now + (30 * oneDay), // Construction starts
        eventEnd: now + (365 * oneDay), // Year-long project
        scheduledDate: now + (30 * oneDay),
        deadline: now + (21 * oneDay), // Permit deadline
        createdAt: now - (60 * oneDay), // 2-month planning phase
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-122.41, 37.65],
          [-122.41, 37.63],
          [-122.37, 37.63],
          [-122.37, 37.65],
          [-122.41, 37.65],
        ]],
      },
      properties: {
        id: "polygon-009",
        name: "Emergency Response Zone",
        type: "emergency",
        density: randomInRange(15, 40),
        population: Math.floor(randomInRange(500, 8000)),
        value: Math.floor(randomInRange(300, 800)),
        status: randomChoice(['active', 'emergency']),
        urgency: 'critical',
        category: 'emergency',
        // DateTime properties - emergency response
        lastUpdate: now - (15 * 60 * 1000), // 15 minutes ago
        lastActivity: now - (5 * 60 * 1000), // 5 minutes ago
        eventStart: now - (2 * oneHour), // Emergency started 2 hours ago
        eventEnd: now + (6 * oneHour), // Expected resolution
        scheduledDate: now - (2 * oneHour),
        deadline: now + (1 * oneHour), // Critical deadline
        createdAt: now - (30 * oneDay), // Emergency zone established
      },
    },
  ],
}
