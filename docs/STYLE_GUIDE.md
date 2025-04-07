# Style Guide

## Function Naming

- Use camelCase for function names
- Avoid abbreviations
- Use verb prefixes for actions:
  - `get` for retrievals
  - `to` for conversions
  - `is` for boolean checks

## Type Definitions

- Use interfaces over types when possible
- Use consistent suffixes:
  - `Expression` for expression types
  - `Options` for configuration objects
  - `Result` for return types

## Documentation

- Every function must have JSDoc/TSDoc with:
  - Description
  - Parameters
  - Return value
  - Example
  - Link to MapLibre documentation
- Example:
  
  ```ts
  /**
   * Creates a color value from red, green, and blue components.
   *
   * @see {@link https://maplibre.org/maplibre-style-spec/expressions/#rgb}
   *
   * @param red - Red component (0-255)
   * @param green - Green component (0-255)
   * @param blue - Blue component (0-255)
   * @returns A color expression
   * 
   * @example
   * ```ts
   * expr.rgb(255, 0, 0) // ["rgb", 255, 0, 0]
   * ```
   */
  ```

## Testing

- Test files mirror source structure
- Test categories:
  - Type checking
  - Input validation
  - Expression compilation
  - Expression evaluation
