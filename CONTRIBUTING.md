# Contributing to imgmin

Thank you for your interest in contributing to imgmin! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 10+

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/imgmin.git
cd imgmin
```

2. Install dependencies:

```bash
pnpm install
```

3. Run tests to verify setup:

```bash
pnpm test
```

## Development Workflow

### Building

```bash
# Build the project
pnpm build

# Watch mode
pnpm build:watch
```

### Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests only
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm fmt

# Check format
pnpm fmt:check

# Type checking
pnpm type-check
```

## Project Structure

```
src/
├── cli.ts              # CLI implementation
├── index.ts            # Public API
├── types/              # Type definitions
├── config/             # Configuration
├── file-scanner/       # File discovery
├── optimizers/         # Format optimizers
├── processor/          # Main orchestration
└── utils/              # Utilities

tests/
├── unit/               # Unit tests
└── e2e/                # E2E tests
```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Write Tests First

Add tests for your feature in the appropriate test file:

- Unit tests: `tests/unit/`
- E2E tests: `tests/e2e/`

### 3. Implement Your Feature

Make sure your code:

- Follows TypeScript strict mode
- Has proper type definitions
- Includes JSDoc comments for public APIs
- Passes all tests

### 4. Update Documentation

- Update README.md if needed
- Update API.md for API changes
- Add CHANGELOG entry

### 5. Commit and Push

```bash
git commit -m "feat: description of your feature"
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

Provide a clear description of:

- What changes you made
- Why you made them
- Any relevant issues

## Code Style

### TypeScript

- Use strict mode
- Add type annotations for all public APIs
- Use meaningful variable names
- Keep functions focused and small

### Naming Conventions

- Files: kebab-case (e.g., `file-scanner.ts`)
- Classes: PascalCase (e.g., `BaseOptimizer`)
- Functions: camelCase (e.g., `getDefaultConfig`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_CONFIG`)

### Comments

- Add JSDoc for public functions
- Explain why, not what
- Keep comments up-to-date

Example:

```typescript
/**
 * Optimize images in a directory
 * @param inputDir - Input directory path
 * @param outputDir - Output directory path
 * @returns Array of results
 */
export async function optimizeImages(inputDir: string, outputDir: string): Promise<ImageOptimizationResult[]> {
  // Implementation
}
```

## Testing Guidelines

### Test Organization

```typescript
describe("Feature Name", () => {
  describe("Sub-feature", () => {
    it("should do something", () => {
      // Test implementation
    });
  });
});
```

### Test Coverage

- Aim for >80% coverage
- Test both happy paths and error cases
- Test integration between components

### Running Tests

```bash
# All tests
pnpm test

# Specific file
pnpm test processor.test.ts

# Matching pattern
pnpm test --grep "should process images"
```

## Performance Considerations

- Consider memory usage for large batches
- Optimize hot paths
- Profile before and after changes
- Add benchmarks for critical paths

## Documentation

- Keep README.md up-to-date
- Update API.md for API changes
- Add examples for new features
- Document breaking changes in CHANGELOG.md

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a Git tag
4. Push changes and tags
5. Publish to npm (maintained only)

## Reporting Bugs

When reporting bugs, include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Node.js version
- Operating system
- Relevant logs or error messages

## Feature Requests

When requesting features:

- Describe the use case
- Provide examples
- Consider backwards compatibility
- Discuss implementation approach

## Questions?

- Check existing issues and discussions
- Open a discussion for questions
- Ask in pull reviews

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to imgmin! 🙏
