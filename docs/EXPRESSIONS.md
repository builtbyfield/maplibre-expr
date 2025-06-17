# Expressions

This document outlines the implementation status of expressions within our TypeScript-based API. Our objective is to create a more intuitive and type-safe API for crafting MapLibre Style Specification expressions, building upon the existing expression language.

Below, you will find a list of core, built-in MapLibre Style Specification expressions and their implementation status in our TypeScript API. Additionally, we have included a list of custom expressions that we have developed by combining built-in expressions to form common patterns and helper functions.

As we implement each feature and its related requirements, we will check it off in the list.

<details>
<summary>Table of Contents</summary>

- [Expressions](#expressions)
  - [Implementation requirements](#implementation-requirements)
  - [Checklist overview](#checklist-overview)
    - [Core expressions checklist](#core-expressions-checklist)
    - [Helper functions checklist](#helper-functions-checklist)
  - [Core expressions](#core-expressions)
    - [Variable binding](#variable-binding)
    - [Types](#types)
    - [Lookup](#lookup)
    - [Decision](#decision)
      - [Basic Decision](#basic-decision)
      - [Value Comparison](#value-comparison)
      - [Logical](#logical)
      - [Spatial](#spatial)
    - [Ramps, scales, curves](#ramps-scales-curves)
    - [Math](#math)
      - [Constants](#constants)
      - [Basic Arithmetic](#basic-arithmetic)
      - [Advanced Math](#advanced-math)
      - [Rounding](#rounding)
      - [Trigonometry](#trigonometry)
      - [Math Comparison](#math-comparison)
      - [Distance](#distance)
    - [Color](#color)
    - [Feature data](#feature-data)
    - [Zoom](#zoom)
    - [Heatmap](#heatmap)
    - [Strings](#strings)
  - [Helper Functions](#helper-functions)
    - [Property Access](#property-access)
    - [Value Checks](#value-checks)
    - [Control Flow](#control-flow)
    - [Scaling and Interpolation](#scaling-and-interpolation)
    - [Temporal](#temporal)
      - [Time Range and Duration](#time-range-and-duration)
      - [Time-based Styling](#time-based-styling)
      - [Time Period Styling](#time-period-styling)
      - [Time Series](#time-series)

</details>

## Implementation requirements

Each expression implementation should have:

1. Type definitions
2. Implementation
3. Unit tests
4. Documentation
5. Examples

## Checklist overview

### Core expressions checklist

- [ ] Variable binding
- [ ] Types
- [ ] Lookup
- [ ] Decision
  - [ ] Basic Decision
  - [x] Value Comparison
  - [x] Logical
  - [x] Spatial
- [ ] Ramps, scales, curves
- [ ] Math
  - [x] Constants
  - [x] Basic Arithmetic
  - [x] Advanced Math
  - [x] Rounding
  - [x] Trigonometry
  - [ ] Math Comparison
  - [ ] Distance
- [ ] Color
- [ ] Feature data
- [x] Zoom
- [ ] Heatmap
- [x] Strings

### Helper functions checklist

- [ ] Property Access
- [ ] Value Checks
- [ ] Control Flow
- [ ] Scaling and Interpolation
- [ ] Temporal
  - [ ] Time Range and Duration
  - [ ] Time-based Styling
  - [ ] Time Period Styling
  - [ ] Time Series

## Core expressions

### Variable binding

Variable binding expressions are used to bind expressions to named variables, which can then be referenced in the result expression using `["var", "variable_name"]`.

- [ ] [let](https://maplibre.org/maplibre-style-spec/expressions/#let): Binds expressions to named variables, which can then be referenced in the result expression using `["var", "variable_name"]`.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [var](https://maplibre.org/maplibre-style-spec/expressions/#var): References variable bound using `let`.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Types

Type expressions are used to assert the type of a value or to convert a value to a specific type.

- [ ] [literal](https://maplibre.org/maplibre-style-spec/expressions/#literal): Provides a literal array or object value.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [array](https://maplibre.org/maplibre-style-spec/expressions/#array): Asserts that the input is an array (optionally with a specific item type and length). If, when the input expression is evaluated, it is not of the asserted type, then this assertion will cause the whole expression to be aborted.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [typeof](https://maplibre.org/maplibre-style-spec/expressions/#typeof): Returns a string describing the type of the given value.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [string](https://maplibre.org/maplibre-style-spec/expressions/#string): Asserts that the input value is a string. If multiple values are provided, each one is evaluated in order until a string is obtained. If none of the inputs are strings, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [number](https://maplibre.org/maplibre-style-spec/expressions/#number): Asserts that the input value is a number. If multiple values are provided, each one is evaluated in order until a number is obtained. If none of the inputs are numbers, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [boolean](https://maplibre.org/maplibre-style-spec/expressions/#boolean): Asserts that the input value is a boolean. If multiple values are provided, each one is evaluated in order until a boolean is obtained. If none of the inputs are booleans, the expression is an error.

  ```ts
  // Syntax
  ["boolean", value, fallback: value, fallback: value, ...]: boolean
  ```

  ```jsonc
  // Example
  "some-property": ["boolean", ["feature-state", "hover"], false]
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] [object](https://maplibre.org/maplibre-style-spec/expressions/#object): Asserts that the input value is an object. If multiple values are provided, each one is evaluated in order until an object is obtained. If none of the inputs are objects, the expression is an error.

  ```ts
  // Syntax
  ["object", value, fallback: value, fallback: value, ...]: object
  ```

  ```jsonc
  // Example
  "some-property": ["object", ["get", "some-property"]]
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] [collator](https://maplibre.org/maplibre-style-spec/expressions/#collator): Returns a `collator` for use in locale-dependent comparison operations. The `case-sensitive` and `diacritic-sensitive` options default to `false`. The `locale` argument specifies the IETF language tag of the locale to use. If none is provided, the default locale is used. If the requested locale is not available, the `collator` will use a system-defined fallback locale. Use `resolved-locale` to test the results of locale fallback behavior.

  ```ts
  // Syntax
  ["collator", collator, { "case-sensitive": boolean, "diacritic-sensitive": boolean, "locale": string }]: collator
  ```

  ```jsonc
  // Example
  "some-property": [
    "collator",
    {
      "case-sensitive": true,
      "diacritic-sensitive": true,
      "locale": "fr"
    }
  ]
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] [format](https://maplibre.org/maplibre-style-spec/expressions/#format): Returns a `formatted` string for displaying mixed-format text in the `text-field` property. The input may contain a string literal or expression, including an `'image'` expression. Strings may be followed by a style override object that supports the following properties:

  - `"text-font"`: Overrides the font stack specified by the root layout property.
  - `"text-color"`: Overrides the color specified by the root paint property.
  - `"font-scale"`: Applies a scaling factor on `text-size` as specified by the root layout property.

  ```ts
  // Syntax
  ["format", value, { "text-font": string, "text-color": color, "font-scale": number }, ...]: formatted
  ```

  ```jsonc
  // Example
  "some-property": [
    "format",
    ["upcase", ["get", "FacilityName"]],
    {"font-scale": 0.8},
    "\n\n",
    {},
    ["downcase", ["get", "Comments"]],
    {"font-scale": 0.6}
  ]
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] [image](https://maplibre.org/maplibre-style-spec/expressions/#image): Returns an image type for use in `icon-image`, `*-pattern` entries and as a section in the `format` expression. If set, the `image` argument will check that the requested image exists in the style and will return either the resolved image name or `null`, depending on whether or not the image is currently in the style. This validation process is synchronous and requires the image to have been added to the style before requesting it in the `image` argument.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [number-format](https://maplibre.org/maplibre-style-spec/expressions/#number-format): Converts the input number into a string representation using the providing formatting rules. If set, the `locale` argument specifies the locale to use, as a BCP 47 language tag. If set, the `currency` argument specifies an ISO 4217 code to use for currency-style formatting. If set, the `min-fraction-digits` and `max-fraction-digits` arguments specify the minimum and maximum number of fractional digits to include.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [to-string](https://maplibre.org/maplibre-style-spec/expressions/#to-string): Converts the input value to a string. If the input is `null`, the result is `""`. If the input is a boolean, the result is `"true"` or `"false"`. If the input is a number, it is converted to a string as specified by the ["NumberToString" algorithm](https://tc39.github.io/ecma262/#sec-tostring-applied-to-the-number-type) of the ECMAScript Language Specification. If the input is a color, it is converted to a string of the form `"rgba(r,g,b,a)"`, where `r`, `g`, and `b` are numerals ranging from 0 to 255, and `a` ranges from 0 to 1. Otherwise, the input is converted to a string in the format specified by the [`JSON.stringify`](https://tc39.github.io/ecma262/#sec-json.stringify) function of the ECMAScript Language Specification.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [to-number](https://maplibre.org/maplibre-style-spec/expressions/#to-number): Converts the input value to a number, if possible. If the input is `null` or `false`, the result is 0. If the input is `true`, the result is 1. If the input is a string, it is converted to a number as specified by the ["ToNumber Applied to the String Type" algorithm](https://tc39.github.io/ecma262/#sec-tonumber-applied-to-the-string-type) of the ECMAScript Language Specification. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [to-boolean](https://maplibre.org/maplibre-style-spec/expressions/#to-boolean): Converts the input value to a boolean. The result is `false` when then input is an empty string, 0, `false`, `null`, or `NaN`; otherwise it is `true`.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [to-color](https://maplibre.org/maplibre-style-spec/expressions/#to-color): Converts the input value to a color. If multiple values are provided, each one is evaluated in order until the first successful conversion is obtained. If none of the inputs can be converted, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Lookup

Lookup expressions are used to retrieve values from arrays, strings, objects, and features.

- [ ] [at](https://maplibre.org/maplibre-style-spec/expressions/#at): Retrieves an item from an array at a specified index.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [in](https://maplibre.org/maplibre-style-spec/expressions/#in): Determines whether an item exists in an array or a substring exists in a string.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [index-of](https://maplibre.org/maplibre-style-spec/expressions/#index-of): Returns the first position at which an item can be found in an array or a substring can be found in a string, or -1 if the input cannot be found. Accepts an optional index from where to begin the search. In a string, a UTF-16 surrogate pair counts as a single position.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [slice](https://maplibre.org/maplibre-style-spec/expressions/#slice): Returns an item from an array or a substring from a string from a specified start index, or between a start index and an end index if set. The return value is inclusive of the start index but not of the end index. In a string, a UTF-16 surrogate pair counts as a single position.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [get](https://maplibre.org/maplibre-style-spec/expressions/#get): Retrieves a property value from the current feature's properties, or from another object if a second argument is provided.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [has](https://maplibre.org/maplibre-style-spec/expressions/#has): Tests for the presence of an property value in the current feature's properties, or from another object if a second argument is provided.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [length](https://maplibre.org/maplibre-style-spec/expressions/#length): Gets the length of an array or string. In a string, a UTF-16 surrogate pair counts as a single position.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Decision

Expressions for making conditional decisions and comparisons.

#### Basic Decision

- [ ] [case](https://maplibre.org/maplibre-style-spec/expressions/#case): Selects the first output whose corresponding test condition evaluates to true, or the fallback value otherwise.
  - [x] Type definitions
  - [x] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [match](https://maplibre.org/maplibre-style-spec/expressions/#match): Selects the output whose label value matches the input value, or the fallback value if no match is found. The input can be any expression. Labels can be single values or arrays of values (all strings or all numbers).
  - [x] Type definitions
  - [x] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [coalesce](https://maplibre.org/maplibre-style-spec/expressions/#coalesce): Evaluates each expression in turn until the first non-null value is obtained, and returns that value.
  - [x] Type definitions
  - [x] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

#### Value Comparison

- [x] **[== (equal)](https://maplibre.org/maplibre-style-spec/expressions/#==)**: Returns true if the input values are equal, false otherwise. The comparison is strictly typed. Accepts an optional collator argument for locale-dependent string comparisons.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[!= (not equal)](https://maplibre.org/maplibre-style-spec/expressions/#!=)**: Returns true if the input values are not equal, false otherwise. The comparison is strictly typed. Accepts an optional collator argument.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[> (greater than)](https://maplibre.org/maplibre-style-spec/expressions/#>)**: Returns true if the first input is strictly greater than the second, false otherwise. Arguments must be both strings or both numbers.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[< (less than)](https://maplibre.org/maplibre-style-spec/expressions/#<)**: Returns true if the first input is strictly less than the second, false otherwise. Arguments must be both strings or both numbers.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[>= (greater than or equal to)](https://maplibre.org/maplibre-style-spec/expressions/#>=)**: Returns true if the first input is greater than or equal to the second, false otherwise. Arguments must be both strings or both numbers.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[<= (less than or equal to)](https://maplibre.org/maplibre-style-spec/expressions/#<=)**: Returns true if the first input is less than or equal to the second, false otherwise. Arguments must be both strings or both numbers.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Logical

- [x] **[all](https://maplibre.org/maplibre-style-spec/expressions/#all)**: Returns true if all the inputs are true, false otherwise. Evaluation is short-circuiting.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[any](https://maplibre.org/maplibre-style-spec/expressions/#any)**: Returns true if any of the inputs are true, false otherwise. Evaluation is short-circuiting.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[! (not)](https://maplibre.org/maplibre-style-spec/expressions/#!)**: Logical negation. Returns true if the input is false, and false if the input is true.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Spatial

- [x] **[within](https://maplibre.org/maplibre-style-spec/expressions/#within)**: Returns true if the evaluated feature is fully contained inside a boundary of the input geometry, false otherwise. Supports Polygon, MultiPolygon, Feature, or FeatureCollection input geometries.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

### Ramps, scales, curves

Expressions for creating graduated scales and interpolated values.

- [ ] [step](https://maplibre.org/maplibre-style-spec/expressions/#step): Produces discrete, stepped results by evaluating a piecewise-constant function defined by pairs of input and output values ("stops"). The `input` may be any numeric expression (e.g., `["get", "population"]`). Stop inputs must be numeric literals in strictly ascending order. Returns the output value of the stop just less than the input, or the first output if the input is less than the first stop.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [interpolate](https://maplibre.org/maplibre-style-spec/expressions/#interpolate): Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). The input may be any numeric expression (e.g., `["get", "population"]`). Stop inputs must be numeric literals in strictly ascending order. The output type must be `number`, `array<number>`, or `color`. Supports three interpolation types:
  - `["linear"]`: Interpolates linearly between the pair of stops just less than and just greater than the input.
    - [ ] Type definitions
    - [ ] Implementation
    - [ ] Unit tests
    - [ ] Documentation
    - [ ] Examples
  - `["exponential", base]`: Interpolates exponentially between stops. Base controls the rate at which the output increases.
    - [ ] Type definitions
    - [ ] Implementation
    - [ ] Unit tests
    - [ ] Documentation
    - [ ] Examples
  - `["cubic-bezier", x1, y1, x2, y2]`: Interpolates using the cubic bezier curve defined by the given control points.
    - [ ] Type definitions
    - [ ] Implementation
    - [ ] Unit tests
    - [ ] Documentation
    - [ ] Examples
- [ ] [interpolate-hcl](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-hcl): Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). Works like `interpolate`, but the output type must be `color`, and the interpolation is performed in the Hue-Chroma-Luminance color space.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [interpolate-lab](https://maplibre.org/maplibre-style-spec/expressions/#interpolate-lab): Produces continuous, smooth results by interpolating between pairs of input and output values ("stops"). Works like `interpolate`, but the output type must be `color`, and the interpolation is performed in the CIELAB color space.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Math

Expressions for performing mathematical calculations and transformations.

#### Constants

- [x] **[e (euler's number)](https://maplibre.org/maplibre-style-spec/expressions/#e)** ([constants.ts](/src/expressions/math/constants.ts), [constants.test.ts](/src/expressions/math/constants.test.ts)): Returns the mathematical constant e (2.718281828459045).
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[ln2 (natural logarithm of 2)](https://maplibre.org/maplibre-style-spec/expressions/#ln2)** ([constants.ts](/src/expressions/math/constants.ts), [constants.test.ts](/src/expressions/math/constants.test.ts)): Returns mathematical constant ln(2) (0.6931471805599453).
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[pi](https://maplibre.org/maplibre-style-spec/expressions/#pi)** ([constants.ts](/src/expressions/math/constants.ts), [constants.test.ts](/src/expressions/math/constants.test.ts)): Returns the mathematical constant pi (3.141592653589793).
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Basic Arithmetic

- [x] **[+ (add)](https://maplibre.org/maplibre-style-spec/expressions/#_8)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): Returns the sum of the inputs.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[- (subtract)](https://maplibre.org/maplibre-style-spec/expressions/#-)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): For two inputs, returns the result of subtracting the second input from the first. For a single input, returns the result of subtracting it from 0.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[\* (multiply)](https://maplibre.org/maplibre-style-spec/expressions/#_9)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): Returns the product of the inputs.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[/ (divide)](https://maplibre.org/maplibre-style-spec/expressions/#_10)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): Returns the result of floating point division of the first input by the second.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[% (modulo)](https://maplibre.org/maplibre-style-spec/expressions/#_11)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): Returns the remainder after integer division of the first input by the second.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[^ (power)](https://maplibre.org/maplibre-style-spec/expressions/#_12)** ([arithmetic.ts](/src/expressions/math/arithmetic.ts), [arithmetic.test.ts](/src/expressions/math/arithmetic.test.ts)): Returns the result of raising the first input to the power specified by the second.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Advanced Math

- [x] [abs (absolute value)](https://maplibre.org/maplibre-style-spec/expressions/#abs): Returns the absolute value of the input.

  ```ts
  // Syntax
  ["abs", number]: number
  ```

  ```jsonc
  // Example
  "some-property": ["abs", -1.5]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] [sqrt (square root)](https://maplibre.org/maplibre-style-spec/expressions/#sqrt): Returns the square root of the input.

  ```ts
  // Syntax
  ["sqrt", number]: number
  ```

  ```jsonc
  // Example
  "some-property": ["sqrt", 9]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] [log2 (base-two logarithm)](https://maplibre.org/maplibre-style-spec/expressions/#log2): Returns the base-two logarithm of the input.

  ```ts
  // Syntax
  ["log2", number]: number
  ```

  ```jsonc
  // Example
  "some-property": ["log2", 8]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] [ln (natural logarithm)](https://maplibre.org/maplibre-style-spec/expressions/#ln): Returns the natural logarithm of the input.

  ```ts
  // Syntax
  ["ln", number]: number
  ```

  ```jsonc
  // Example
  "some-property": ["ln", 8]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] [log10 (base-ten logarithm)](https://maplibre.org/maplibre-style-spec/expressions/#log10): Returns the base-ten logarithm of the input.

  ```ts
  // Syntax
  ["log10", number]: number
  ```

  ```jsonc
  // Example
  "some-property": ["log10", 8]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Rounding

- [x] **[round](https://maplibre.org/maplibre-style-spec/expressions/#round)** ([rounding.ts](/src/expressions/math/rounding.ts), [rounding.test.ts](/src/expressions/math/rounding.test.ts)): Rounds the input to the nearest integer. Halfway values are rounded away from zero. For example, `["round", -1.5]` evaluates to -2.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[ceil](https://maplibre.org/maplibre-style-spec/expressions/#ceil)** ([rounding.ts](/src/expressions/math/rounding.ts), [rounding.test.ts](/src/expressions/math/rounding.test.ts)): Returns the smallest integer that is greater than or equal to the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[floor](https://maplibre.org/maplibre-style-spec/expressions/#floor)** ([rounding.ts](/src/expressions/math/rounding.ts), [rounding.test.ts](/src/expressions/math/rounding.test.ts)): Returns the largest integer that is less than or equal to the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Trigonometry

- [x] **[sin (sine)](https://maplibre.org/maplibre-style-spec/expressions/#sin)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the sine of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[cos (cosine)](https://maplibre.org/maplibre-style-spec/expressions/#cos)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the cosine of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[tan (tangent)](https://maplibre.org/maplibre-style-spec/expressions/#tan)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the tangent of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[asin (arcsine)](https://maplibre.org/maplibre-style-spec/expressions/#asin)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the arcsine of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[acos (arccosine)](https://maplibre.org/maplibre-style-spec/expressions/#acos)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the arccosine of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples
- [x] **[atan (arctangent)](https://maplibre.org/maplibre-style-spec/expressions/#atan)** ([trigonometry.ts](/src/expressions/math/trigonometry.ts), [trigonometry.test.ts](/src/expressions/math/trigonometry.test.ts)): Returns the arctangent of the input.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

#### Math Comparison

- [ ] [min (minimum)](https://maplibre.org/maplibre-style-spec/expressions/#min): Returns the minimum value of the inputs.

  ```ts
  // Syntax
  ["min", number, number, ...]: number
  ```

  ```jsonc
  // Example
  "some-property": ["min", 1, 2]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] [max (maximum)](https://maplibre.org/maplibre-style-spec/expressions/#max): Returns the maximum value of the inputs.

  ```ts
  // Syntax
  ["max", number, number, ...]: number
  ```

  ```jsonc
  // Example
  "some-property": ["max", 1, 2]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

#### Distance

- [ ] [distance](https://maplibre.org/maplibre-style-spec/expressions/#distance): Returns the shortest distance in meters between the evaluated feature and the input geometry. The input value can be a valid GeoJSON of type `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`, `Feature`, or `FeatureCollection`. Distance values returned may vary in precision due to loss in precision from encoding geometries, particularly below zoom level 13.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Color

Expressions for manipulating and converting color values.

- [ ] [to-rgba](https://maplibre.org/maplibre-style-spec/expressions/#to-rgba): Returns a four-element array containing the input color's red, green, blue, and alpha components, in that order.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [rgb](https://maplibre.org/maplibre-style-spec/expressions/#rgb): Creates a color value from red, green, and blue components, which must range between 0 and 255, and an alpha component of 1. If any component is out of range, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [rgba](https://maplibre.org/maplibre-style-spec/expressions/#rgba): Creates a color value from red, green, blue components, which must range between 0 and 255, and an alpha component which must range between 0 and 1. If any component is out of range, the expression is an error.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Feature data

Feature data expressions provide access to properties and metadata of geographic features in the map.

- [ ] [properties](https://maplibre.org/maplibre-style-spec/expressions/#properties): Gets the feature properties object. Note that in some cases, it may be more efficient to use `["get", "property_name"]` directly.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [feature-state](https://maplibre.org/maplibre-style-spec/expressions/#feature-state): Retrieves a property value from the current feature's state. Returns null if the requested property is not present on the feature's state. A feature's state is not part of the GeoJSON or vector tile data, and must be set programmatically on each feature. When `source.promoteId` is not provided, features are identified by their id attribute, which must be an integer or a string that can be cast to an integer. When `source.promoteId` is provided, features are identified by their `promoteId` property, which may be a number, string, or any primitive data type. Note that `["feature-state"]` can only be used with paint properties that support data-driven styling.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [geometry-type](https://maplibre.org/maplibre-style-spec/expressions/#geometry-type): Gets the feature's geometry type: `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `MultiPolygon`.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [id](https://maplibre.org/maplibre-style-spec/expressions/#id): Gets the feature's `id`, if it has one.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [line-progress](https://maplibre.org/maplibre-style-spec/expressions/#line-progress): Gets the progress along a gradient line. Can only be used in the `line-gradient` property.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
- [ ] [accumulated](https://maplibre.org/maplibre-style-spec/expressions/#accumulated): Gets the value of a cluster property accumulated so far. Can only be used in the `clusterProperties` option of a clustered GeoJSON source.
  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Zoom

Zoom expressions are used to get the current zoom level.

- [x] [zoom](https://maplibre.org/maplibre-style-spec/expressions/#zoom_1): Gets the current zoom level. Note that in style layout and paint properties, `["zoom"]` may only appear as the input to a top-level `step` or `interpolate` expression.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

### Heatmap

Heatmap expressions are used to get the kernel density estimation of a pixel in a heatmap layer, which is a relative measure of how many data points are crowded around a particular pixel.

- [x] [heatmap-density](https://maplibre.org/maplibre-style-spec/expressions/#heatmap-density): Gets the kernel density estimation of a pixel in a heatmap layer, which is a relative measure of how many data points are crowded around a particular pixel. Can only be used in the `heatmap-color` property.
  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

### Strings

Expressions for manipulating and working with text strings.

- [x] **[is-supported-script](https://maplibre.org/maplibre-style-spec/expressions/#is-supported-script)**: Returns `true` if the input string is expected to render legibly. Returns `false` if the input string contains sections that cannot be rendered without potential loss of meaning (e.g. Indic scripts that require complex text shaping, or right-to-left scripts if the `mapbox-gl-rtl-text` plugin is not in use in MapLibre GL JS).

  ```ts
  // Syntax
  ["is-supported-script", string]: boolean
  ```

  ```jsonc
  // Example
  "some-property": ["is-supported-script", "दिल्ली"]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] **[upcase](https://maplibre.org/maplibre-style-spec/expressions/#upcase)**: Returns the input string converted to uppercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.

  ```ts
  // Syntax
  ["upcase", string]: string
  ```

  ```jsonc
  // Example
  "some-property": ["upcase", ["get", "name"]]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] **[downcase](https://maplibre.org/maplibre-style-spec/expressions/#downcase)**: Returns the input string converted to lowercase. Follows the Unicode Default Case Conversion algorithm and the locale-insensitive case mappings in the Unicode Character Database.

  ```ts
  // Syntax
  ["downcase", string]: string
  ```

  ```jsonc
  // Example
  "some-property": ["downcase", ["get", "name"]]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] **[concat](https://maplibre.org/maplibre-style-spec/expressions/#concat)**: Returns a `string` consisting of the concatenation of the inputs. Each input is converted to a string as if by `to-string`.

  ```ts
  // Syntax
  ["concat", string, string, ...]: string
  ```

  ```jsonc
  // Example
  "some-property": ["concat", "square-rgb-", ["get", "color"]]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

- [x] **[resolved-locale](https://maplibre.org/maplibre-style-spec/expressions/#resolved-locale)**: Returns the IETF language tag of the locale being used by the provided `collator`. This can be used to determine the default system locale, or to determine if a requested locale was successfully loaded.

  ```ts
  // Syntax
  ["resolved-locale", collator]: string
  ```

  ```jsonc
  // Example
  "some-property": [
    "resolved-locale",
    [
      "collator",
      {
        "case-sensitive": true,
        "diacritic-sensitive": false,
        "locale": "de"
      }
    ]
  ]
  ```

  - [x] Type definitions
  - [x] Implementation
  - [x] Unit tests
  - [x] Documentation
  - [x] Examples

## Helper Functions

Helper functions that combine multiple MapLibre expressions for common use cases.

### Property Access

- [ ] `safeGet(key: string, fallback: Expression)`: Safely gets a property from a feature with a fallback value.

  ```ts
  // Returns: ["case", ["has", "population"], ["get", "population"], 0]
  safeGet("population", 0)
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `propertyEquals(key: string, value: any)`: Shorthand for checking equality of a property's value.

  ```ts
  // Returns: ["==", ["get", "type"], "park"]
  propertyEquals("type", "park")
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Value Checks

- [ ] `inList(key: string, values: (string|number)[])`: Checks if a property's value is in an array of allowed values.

  ```ts
  // Returns: ["any", ["==", ["get", "type"], "park"], ["==", ["get", "type"], "museum"]]
  inList("type", ["park", "museum"])
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `rangeCheck(key: string, min: number, max: number)`: Verifies if a numeric property is within a range.

  ```ts
  // Returns: ["all", [">=", ["get", "height"], 10], ["<=", ["get", "height"], 100]]
  rangeCheck("height", 10, 100)
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `stringContains(key: string, substring: string)`: Checks if a property contains a substring.

  ```ts
  // Returns: [">", ["index-of", "Street", ["get", "name"]], -1]
  stringContains("name", "Street")
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Control Flow

- [ ] `ifElse(condition: Expression, trueVal: Expression, falseVal: Expression)`: Readable wrapper for conditional logic.

  ```ts
  // Returns: ["case", ["==", ["get", "type"], "park"], "green", "gray"]
  ifElse(["==", ["get", "type"], "park"], "green", "gray")
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Scaling and Interpolation

- [ ] `colorScale(key: string, stopsAndColors: (number|string)[])`: Linear color interpolation across defined stops.

  ```ts
  // Returns: ["interpolate", ["linear"], ["get", "population"], 0, "blue", 1000, "red"]
  colorScale("population", [0, "blue", 1000, "red"])
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `numberScale(key: string, domain: [number, number], range: [number, number])`: Scales a numeric property from one domain to another.

  ```ts
  // Returns: ["interpolate", ["linear"], ["get", "age"], 0, 0, 100, 10]
  numberScale("age", [0, 100], [0, 10])
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

### Temporal

#### Time Range and Duration

- [ ] `temporalRangeCheck(key: string, startTime: number, endTime: number)`: Check if a timestamp falls between two times.

  ```ts
  // Returns: ["all", [">=", ["get", "timestamp"], startTime], ["<=", ["get", "timestamp"], endTime]]
  temporalRangeCheck("timestamp", startTime, endTime)
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `timeSinceLastUpdate(key: string, currentTime: number)`: Compute duration in seconds since a feature's last update.

  ```ts
  // Returns: ["/", ["-", currentTime, ["get", "last_updated"]], 1000]
  timeSinceLastUpdate("last_updated", currentTime)
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `temporalBooleanFlag(key: string, currentTime: number, thresholdMs: number)`: Check if a feature is "fresh" based on timestamp.

  ```ts
  // Returns: ["case", ["<", ["-", currentTime, ["get", key]], thresholdMs], 1, 0]
  temporalBooleanFlag("timestamp", currentTime, 300000) // 5 minutes
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

#### Time-based Styling

- [ ] `temporalScale(key: string, currentTime: number, startTime: number, endTime: number, startVal: number, endVal: number)`: Interpolate a value over time.

  ```ts
  // Returns: ["interpolate", ["linear"], ["-", currentTime, ["get", key]], startTime, startVal, endTime, endVal]
  temporalScale("timestamp", currentTime, startTime, endTime, 0, 1) // Fade from 0 to 1
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `timeWeightedColor(key: string, currentTime: number, durationMs: number, startColor: string, endColor: string)`: Blend colors based on recency.

  ```ts
  // Returns: ["interpolate", ["linear"], ["-", currentTime, ["get", key]], 0, startColor, durationMs, endColor]
  timeWeightedColor("timestamp", currentTime, 3600000, "green", "brown") // 1 hour transition
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `temporalThresholdSize(key: string, currentTime: number, thresholds: Array<{timeAgo: number; size: number}>, fallback: number)`: Size features based on timestamp thresholds.

  ```ts
  // Returns: ["case", ...thresholdConditions, fallback]
  temporalThresholdSize("timestamp", currentTime, [{ timeAgo: 60000, size: 10 }, { timeAgo: 300000, size: 6 }], 2)
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

#### Time Period Styling

- [ ] `dayPartStyling(hourKey: string, colors: { morning: string; afternoon: string; evening: string; night: string }, fallback: string)`: Style based on time of day.

  ```ts
  // Returns: ["case", ...dayPartConditions, fallback]
  dayPartStyling("hour_of_day", {
    morning: "yellow",
    afternoon: "orange",
    evening: "purple",
    night: "blue"
  }, "gray")
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

- [ ] `weekendHighlight(dayKey: string, weekendColor: string, weekdayColor: string)`: Different styles for weekends vs weekdays.

  ```ts
  // Returns: ["case", ["any", ["==", ["get", dayKey], 0], ["==", ["get", dayKey], 6]], weekendColor, weekdayColor]
  weekendHighlight("day_of_week", "red", "gray")
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples

#### Time Series

- [ ] `movingWindowGradient(arrayKey: string, indexExpr: Expression, stopsAndColors: (number|string)[])`: Color based on time series value at current index.

  ```ts
  // Returns: ["interpolate", ["linear"], ["at", indexExpr, ["get", arrayKey]], ...stopsAndColors]
  movingWindowGradient("values", currentIndex, [0, "blue", 100, "red"])
  ```

  - [ ] Type definitions
  - [ ] Implementation
  - [ ] Unit tests
  - [ ] Documentation
  - [ ] Examples
