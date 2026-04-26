# imgmin

Image minification and optimization CLI tool with API support.

## Features

- ✅ Optimize JPG, PNG, GIF, SVG images
- ✅ Convert to WebP and AVIF formats
- ✅ CLI interface for command-line usage
- ✅ Exportable API for programmatic use
- ✅ Recursive directory processing
- ✅ JSON configuration support
- ✅ Metadata removal (EXIF, color profiles)
- ✅ ES6 modules
- ✅ Vitest for testing

## Installation

```bash
pnpm install
```

## Quick Start

### CLI Usage

```bash
# Basic usage
pnpm start -- --input ./images --output ./dist

# With quality and metadata removal
pnpm start -- --input ./images --output ./dist --quality 75 --remove-metadata

# Convert to WebP
pnpm start -- --input ./images --output ./dist --convert-webp

# Full example
pnpm start -- --input ./images --output ./dist --quality 80 --remove-metadata --convert-webp --verbose
```

### CLI Options

- `--input, -i` (required) — Input directory
- `--output, -o` (required) — Output directory
- `--config, -c` — Path to JSON config file
- `--quality, -q` — Quality level (0-100)
- `--remove-metadata` — Remove EXIF and other metadata
- `--convert-webp` — Convert to WebP format
- `--convert-avif` — Convert to AVIF format
- `--workers` — Number of parallel workers (default: 1)
- `--verbose, -v` — Verbose logging

### API Usage

```javascript
import { optimizeImages } from './src/index.js'

const results = await optimizeImages({
  inputDir: './images',
  outputDir: './dist',
  config: {
    formats: {
      jpg: { quality: 80, progressive: true },
      png: { quality: 9 },
    },
    convertTo: {
      webp: { enabled: true, quality: 80 },
    },
  },
})

console.log(results)
```

## Configuration

Create `imgmin-config.json` in your project:

```json
{
  "formats": {
    "jpg": {
      "quality": 80,
      "progressive": true,
      "removeMetadata": true
    },
    "png": {
      "quality": 9,
      "removeMetadata": true
    },
    "gif": {
      "optimizationLevel": 3,
      "removeMetadata": true
    },
    "svg": {
      "minify": true
    }
  },
  "convertTo": {
    "webp": { "enabled": false, "quality": 80 },
    "avif": { "enabled": false, "quality": 60 }
  },
  "output": {
    "preserveStructure": true,
    "suffix": ""
  }
}
```

## Development

### Project Structure

```
imgmin/
├── bin/
│   └── imgmin.js          # CLI entry point
├── src/
│   ├── index.js           # Main API export
│   ├── cli.js             # CLI module
│   ├── config/            # Configuration management
│   ├── optimizers/        # Image format optimizers
│   └── utils/             # Utilities
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── fixtures/          # Test images
│   └── logger.test.js     # Logger tests
├── examples/              # Usage examples
├── docs/                  # Documentation
├── package.json
├── vitest.config.js       # Vitest configuration
└── ARCHITECTURE.md        # Full architecture plan
```

### Scripts

```bash
# Run CLI with help
pnpm start -- --help

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint code
pnpm lint
```

### Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Package Manager**: pnpm
- **Image Processing**: sharp, svgo
- **CLI**: yargs
- **Testing**: Vitest

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation including:
- Module decomposition
- Data flow diagrams
- Agent responsibilities
- Implementation phases
- Design patterns

## Development Phases

1. **Phase 1** ✅ — Basic project structure (CLI, API, Logger)
2. **Phase 2** — Config Manager + Defaults
3. **Phase 3** — File Scanner
4. **Phase 4-6** — Format Optimizers (JPG, PNG, GIF, SVG, WebP, AVIF)
5. **Phase 7** — Processor (orchestration)
6. **Phase 8** — Logger enhancements
7. **Phase 9** — API Module (full integration)
8. **Phase 10** — CLI Module (full integration)
9. **Phase 11** — Documentation + Examples
10. **Phase 12** — E2E Testing + Optimization

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
