# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-02

### Initial Release

A comprehensive image optimization CLI tool and API for Node.js with support for multiple image formats.

#### Added

**Core Features**

- CLI interface with full argument parsing via Yargs
- Programmatic API for Node.js applications
- Support for 6 image formats: JPG, PNG, GIF, SVG, WebP, AVIF
- Batch processing with recursive directory scanning
- Quality control with format-specific optimization
- Progress tracking with real-time callbacks
- Detailed statistics and reporting

**Format Support**

- **JPG/JPEG** - Progressive JPEG with quality control (0-100)
- **PNG** - Compression levels (0-9) with optional metadata removal
- **GIF** - Animation support with optimization levels
- **SVG** - Minification via SVGO with multipass optimization
- **WebP** - Modern codec conversion from existing formats
- **AVIF** - Next-generation codec for superior compression

**Configuration**

- CLI arguments for quick usage
- JSON configuration files for persistent settings
- Sensible defaults for all formats
- Configuration merging (CLI > JSON > defaults)
- Zod schema validation for type safety

**File Management**

- Recursive directory scanning
- Format filtering (.jpg, .png, .gif, .svg, .webp, .avif)
- File size filtering (min/max)
- Sorting by name, size, or extension
- Metadata removal (EXIF, color profiles)

**Developer Experience**

- 100% TypeScript with strict mode
- Comprehensive type definitions
- 111 unit and E2E tests
- Full JSDoc documentation
- Clear error messages and logging

**Performance**

- 36%+ size reduction on real image collections
- Processing speed: ~11 files/second
- Memory-efficient batch processing
- Optional dry-run mode for testing

**Architecture**

- Modular design with clear separation of concerns
- Abstract base optimizer for extensibility
- Factory pattern for optimizer selection
- Pipeline architecture with progress callbacks
- Error handling at multiple levels

#### Test Coverage

- **84 unit tests** across all components
- **27 E2E tests** with real images
- **111 total tests** with 100% pass rate

Real-world benchmark:

- 17 diverse images (JPG, PNG, GIF, SVG, WebP, AVIF)
- 885.3 KB → 569.41 KB (35.7% reduction)
- Processing time: ~1.6 seconds
- Speed: 11 files/second

#### Documentation

- Comprehensive README with examples
- API documentation with TypeScript examples
- Configuration file format documentation
- Performance benchmarks
- Architecture overview
- Troubleshooting guide

#### Development Tools

- TypeScript 6.0.3 with strict configuration
- Vitest 4.1.5 for testing
- Oxlint 1.61.0 for code quality
- tsdown 0.21.10 for bundling
- Sharp 0.34.5 for image processing
- SVGO 4.0.1 for SVG optimization
- Yargs 18.0.0 for CLI parsing
- Zod 3.25.76 for validation

#### CLI Usage

```bash
imgmin --input ./images --output ./optimized [options]

Options:
  -i, --input          Input directory (required)
  -o, --output         Output directory (required)
  -c, --config         Config file path
  -q, --quality        Quality level 0-100
  --remove-metadata    Remove metadata
  --convert-webp       Convert to WebP
  --convert-avif       Convert to AVIF
  --dry-run            Dry run without writing
  -v, --verbose        Verbose output
  -h, --help           Show help
  -V, --version        Show version
```

#### API Usage

```typescript
import { optimizeImages } from "imgmin";

const results = await optimizeImages("./input", "./output", { quality: 80 }, onProgress, onError);
```

#### Future Roadmap

- Parallel processing with configurable workers
- Output format conversion
- Batch processing optimization
- Cloud storage integration
- Web UI for management
- Performance profiling
- Advanced image analysis
- Automated quality detection

---

## Development Timeline

- **Phase 1**: Foundation - TypeScript setup, Logger, CLI structure
- **Phase 2**: Config Manager - Validation, defaults, merging
- **Phase 3**: File Scanner - Directory scanning, filtering, sorting
- **Phase 4-6**: Format Optimizers - JPG, PNG, GIF, SVG, WebP, AVIF support
- **Phase 7**: Processor - Main orchestration engine
- **Phase 8**: API Integration - Public API exports
- **Phase 9**: CLI Enhancement - Full CLI implementation with progress
- **Phase 10**: E2E Testing - Real image testing
- **Phase 11**: Documentation & Polish - Final release preparation
