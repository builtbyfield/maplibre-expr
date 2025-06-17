# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm test` - Run tests using Vitest
- `pnpm coverage` - Run tests with coverage report
- `pnpm lint` - Lint and fix code using ESLint
- `pnpm typecheck` - Type check without emitting files

### Playground Development

- `cd playground && pnpm dev` - Start the playground development server
- `cd playground && pnpm build` - Build the playground app

### Testing

- Tests use Vitest and are located alongside source files as `*.test.ts`
- Run a single test file: `pnpm test path/to/file.test.ts`
- Run tests in watch mode: `pnpm test --watch`

## Architecture

This is a TypeScript library providing type-safe wrapper functions for MapLibre Style Specification expressions. The codebase follows a modular architecture:

### Core Structure

- **`/src/core/`** - MapLibre spec-compliant expressions organized by category:

  - `color/` - Color manipulation and conversion
  - `decision/` - Comparison, logical operations, and control flow
  - `feature-data/` - Feature property access
  - `heatmap/` - Heatmap-specific operations
  - `interpolation/` - Ramps, scales, and curves
  - `lookup/` - Array and object operations
  - `math/` - Arithmetic, trigonometry, logarithmic, exponential, rounding, distance, and constants
  - `strings/` - String manipulation
  - `types/` - Type assertions, conversions, and formatting
  - `variables/` - Variable binding
  - `zoom/` - Zoom-related expressions

- **`/src/custom/`** - Non-spec extensions:
  - `datetime/` - Date and time operations

### Key Design Patterns

1. **Expression Builder Pattern**: Fluent API for chaining expressions
2. **Type Safety**: All expressions are fully typed with TypeScript
3. **Module Organization**: Each subdirectory has an `index.ts` that re-exports all functions
4. **Function Access**: Expressions can be accessed via:
   - Direct import: `import { add } from '@builtbyfield/maplibre-expression-helpers'`
   - Category import: `import { math } from '@builtbyfield/maplibre-expression-helpers'`
   - Sub-category: `math.arithmetic.add(...)`

### Testing Approach

- Unit tests are colocated with source files (e.g., `arithmetic.ts` → `arithmetic.test.ts`)
- Test utilities exist for common testing patterns
- Tests validate both the structure and behavior of expressions

### Build Configuration

- Uses tsup for bundling (entry: `src/index.ts`)
- TypeScript target: ESNext with strict mode
- ESLint with @antfu/eslint-config for code quality
- Monorepo setup with pnpm workspaces and catalogs for dependency management
