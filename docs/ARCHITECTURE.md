# Architecture

## Project Structure

```ascii
src/
├── core/
│   ├── color/         # Color manipulation and conversion
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   ├── decision/      # Logical operations and control flow
│   │   ├── comparison.ts    # Comparison operations
│   │   ├── control-flow.ts  # Control flow operations
│   │   ├── logical.ts       # Logical operations
│   │   └── index.ts         # Module entry point
│   ├── feature-data/  # Feature data
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   ├── heatmap/       # Heatmap
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   ├── interpolation/ # Ramps, scales, and curves
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   ├── lookup/        # Array and object operations
│   │   ├── array.ts         # Array operations
│   │   ├── object.ts        # Object operations
│   │   ├── string.ts        # String operations
│   │   └── index.ts         # Module entry point
│   ├── math/          # Math operations
│   │   ├── arithmetic.ts    # Arithmetic operations
│   │   ├── trigonometry.ts  # Trigonometric operations
│   │   ├── exponential.ts   # Exponential operations
│   │   ├── logarithmic.ts   # Logarithmic operations
│   │   ├── rounding.ts      # Rounding operations
│   │   └── index.ts         # Module entry point
│   ├── string/        # String manipulation
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   ├── types/         # Type assertions and conversions
│   │   ├── assertion.ts     # Type assertions
│   │   ├── conversion.ts    # Type conversions
│   │   ├── formatting.ts    # Type formatting
│   │   └── index.ts         # Module entry point
│   ├── variables/     # Variable binding
│   │   ├── .ts              # ...
│   │   └── index.ts         # Module entry point
│   └── zoom/          # Zoom
│       ├── .ts              # ...
│       └── index.ts         # Module entry point
├── custom/
│   ├── datetime/      # Date and time operations
│   │   ├── comparison.ts    # Comparison operations
│   │   ├── conversion.ts    # Date and time conversion
│   │   └── index.ts         # Module entry point
├── utils/
│   ├── builder.ts     # Expression builder
│   ├── types.ts       # Shared types
│   └── validation.ts  # Input validation
└── index.ts           # Main entry point
```

## Core Principles

1. **Single Responsibility**: Each module handles one category of expressions
2. **Type Safety**: All functions are fully typed with TypeScript
3. **Immutability**: All functions return new expressions without modifying inputs
4. **Consistency**: Follow MapLibre's expression syntax strictly
5. **Documentation**: Every function has JSDoc with examples

## Expression Builder Pattern

The Expression Builder provides a fluent API for creating complex expressions:

```ts
interface ExpressionBuilder<T> {
  // Returns the final expression
  build: () => ExpressionSpecification
  // Chains another expression
  pipe: (expr: ExpressionSpecification) => ExpressionBuilder<T>
  // Type-specific operations based on generic T
  // e.g., for T = number:
  add: (value: NumericExpression) => ExpressionBuilder<number>
  multiply: (value: NumericExpression) => ExpressionBuilder<number>
}
```

## Type System

We use a consistent type system across the project:

```ts
type BaseExpression = string | number | boolean

type Expression = BaseExpression | ExpressionSpecification

interface TypedExpression<T> extends ExpressionSpecification {
  type?: T // Phantom type for type safety
}
```
