# Custom Expression Helpers

This directory contains high-level expression helpers that compose core MapLibre expressions to solve common real-world problems. These helpers make it easier to implement complex logic without having to manually compose multiple low-level expressions.

## Categories

### 1. DateTime (`datetime.ts`)

Utilities for working with dates and times.

**Example Use Case**: Show only events happening today

```typescript
// Highlight venues with events today
const paint = {
  "circle-color": [
    "case",
    datetime.isToday(["get", "eventDate"]),
    "#ff0000", // Red for today's events
    "#0000ff" // Blue for other days
  ]
}
```

### 2. Data Quality & Validation (`validation.ts`)

Check data integrity and validate field values.

**Example Use Case**: Only show features with complete information

```typescript
// Show markers only for listings with all required fields
const filter = validation.hasRequiredFields(["name", "address", "phone"])
```

### 3. Statistical & Aggregation (`statistics.ts`)

Calculate statistics and aggregations across properties.

**Example Use Case**: Normalize values for consistent visualization

```typescript
// Scale circle radius based on normalized population
const paint = {
  "circle-radius": ["*", 10, statistics.normalize(["get", "population"], 0, 1000000)]
}
```

### 4. Geospatial Utilities (`geospatial.ts`)

Advanced spatial operations beyond basic MapLibre functions.

**Example Use Case**: Show only features within a certain radius

```typescript
// Filter POIs within 5km of city center
const filter = geospatial.isWithinRadius(
  { type: "Point", coordinates: [-122.4194, 37.7749] },
  5000
)
```

### 5. Text Analysis (`text.ts`)

Advanced string operations and text processing.

**Example Use Case**: Filter features by text content

```typescript
// Show only restaurants with specific keywords in description
const filter = text.containsAny(["get", "description"], ["pizza", "italian", "pasta"])
```

### 6. Color Utilities (`color-utils.ts`)

Advanced color operations and theming.

**Example Use Case**: Automatically assign colors by category

```typescript
// Color code features by type
const paint = {
  "fill-color": colorUtils.colorByCategory(["get", "type"], {
    residential: "#4CAF50",
    commercial: "#2196F3",
    industrial: "#FF9800"
  })
}
```

### 7. Business Logic (`business.ts`)

Common business rules and date/time logic.

**Example Use Case**: Show if a store is currently open

```typescript
// Different opacity for open/closed stores
const paint = {
  "circle-opacity": [
    "case",
    business.isBusinessHours(["get", "currentTime"]),
    1.0, // Fully visible when open
    0.3 // Semi-transparent when closed
  ]
}
```

### 8. Data Transformation (`transform.ts`)

Transform and categorize data for visualization.

**Example Use Case**: Group numeric values into categories

```typescript
// Categorize temperature into ranges
const paint = {
  "fill-color": transform.bucket(["get", "temperature"], [
    { max: 32, output: "#0000ff" }, // Freezing
    { max: 60, output: "#00ff00" }, // Cool
    { max: 80, output: "#ffff00" }, // Warm
    { max: Infinity, output: "#ff0000" } // Hot
  ])
}
```

### 9. Conditional Styling (`styling.ts`)

Complex styling patterns and animations.

**Example Use Case**: Scale features based on zoom level

```typescript
// Adjust icon size smoothly with zoom
const layout = {
  "icon-size": styling.scaleByZoom(1, 10, 16) // Base size 1, scales from zoom 10 to 16
}
```

### 10. Units & Measurement (`units.ts`)

Convert and format units of measurement.

**Example Use Case**: Display user-friendly distances

```typescript
// Show distance in appropriate units
const layout = {
  "text-field": units.formatDistance(["get", "distanceMeters"], true) // Imperial units
}
```

## Usage

Import the helpers you need:

```typescript
import {
  datetime,
  statistics,
  validation
} from "@builtbyfield/maplibre-expression-helpers"

// Use in your layer configuration
const layer = {
  id: "my-layer",
  type: "circle",
  filter: [
    "all",
    datetime.isWithinNextDuration(["get", "eventDate"], 7 * 24 * 60 * 60 * 1000), // Next 7 days
    validation.hasRequiredFields(["name", "date", "location"])
  ],
  paint: {
    "circle-radius": statistics.normalize(["get", "attendance"], 0, 10000),
    "circle-color": colorUtils.colorByCategory(["get", "eventType"], {
      concert: "#e91e63",
      sports: "#4caf50",
      conference: "#2196f3"
    })
  }
}
```

## Testing

Each custom expression module has a corresponding test file (e.g., `datetime.test.ts`). Run tests with:

```bash
npm test src/custom/
```

## Contributing

When adding new custom expressions:

1. Identify common patterns that require multiple core expressions
2. Create a new module in the appropriate category
3. Export functions that return `ExpressionSpecification`
4. Add comprehensive tests
5. Update this README with examples
6. Add the export to `src/custom/index.ts`
