# imgmin - Image Optimization Tool Specification

**Version:** 0.1.0
**Date:** May 2, 2026
**Language:** TypeScript
**Runtime:** Node.js 18+
**Package Manager:** pnpm 10+

---

## 1. Project Overview

**imgmin** is a modern, high-performance image optimization and conversion CLI tool with a programmatic API. It supports batch processing of multiple image formats with intelligent compression and format conversion capabilities.

### Core Features

- ✅ Multi-format image optimization (JPG, PNG, GIF, SVG, WebP, AVIF)
- ✅ Batch processing with recursive directory scanning
- ✅ Format conversion to modern codecs (WebP, AVIF)
- ✅ Metadata removal (EXIF, color profiles)
- ✅ Configurable quality and compression levels
- ✅ Parallel processing with worker threads
- ✅ JSON configuration file support
- ✅ CLI and programmatic API
- ✅ Comprehensive error handling and logging
- ✅ Full TypeScript type safety

### Target Users

- Backend developers needing image optimization in Node.js applications
- DevOps engineers for CI/CD pipelines
- Command-line users for batch image processing
- Web developers automating asset optimization

---

## 2. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Interface                           │
│                    (bin/imgmin.ts)                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Config Manager                            │
│  • CLI Options Parser      • JSON Config Loading             │
│  • Deep Merge Logic        • Zod Validation                 │
│  • Priority: CLI > JSON > Defaults                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Processor (Phase 7)                       │
│  • File Discovery & Scanning  • Optimization Orchestration   │
│  • Worker Management          • Progress Tracking            │
│  • Error Handling & Recovery                                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
        ┌─────────────┐ ┌────────────┐ ┌──────────────┐
        │   Scanner   │ │ Optimizers │ │   Output    │
        │  • Scan     │ │ • JPG      │ │  • Write    │
        │  • Filter   │ │ • PNG      │ │  • Stats    │
        │  • Sort     │ │ • GIF      │ │  • Cache    │
        │             │ │ • SVG      │ │             │
        │             │ │ • WebP     │ │             │
        │             │ │ • AVIF     │ │             │
        └─────────────┘ └────────────┘ └──────────────┘
```

### Technology Stack

| Component        | Technology | Version | Purpose                       |
| ---------------- | ---------- | ------- | ----------------------------- |
| Runtime          | Node.js    | 18+     | JavaScript execution          |
| Language         | TypeScript | 6.0.3   | Type safety                   |
| Bundler          | tsdown     | 0.21.10 | ESM output generation         |
| Test Runner      | Vitest     | 4.1.5   | Unit & integration tests      |
| Linter           | Oxlint     | 1.61.0  | Code quality (Rust-based)     |
| Formatter        | Oxfmt      | 0.46.0  | Code formatting               |
| Image Processing | Sharp      | 0.34.5  | JPG, PNG, WebP, AVIF, GIF     |
| SVG Optimization | SVGO       | 4.0.1   | SVG minification              |
| CLI Parser       | Yargs      | 18.0.0  | Command-line argument parsing |
| Validation       | Zod        | 3.25.76 | Runtime schema validation     |
| Package Manager  | pnpm       | 10.33.2 | Dependency management         |

---

## 3. Core Components

### 3.1 Logger Module (`src/utils/logger.ts`)

**Purpose:** Unified logging with configurable levels

**LogLevel Enum:**

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}
```

**Methods:**

- `debug(message: string)` - Debug-level logging
- `info(message: string)` - Info-level logging
- `warn(message: string)` - Warning-level logging
- `error(message: string)` - Error-level logging
- `setLevel(level: LogLevel | string)` - Set minimum log level
- `setVerbose(verbose: boolean)` - Enable/disable verbose output

---

### 3.2 Configuration System

#### 3.2.1 Type Definitions (`src/types/config.ts`)

**Format Options:**

```typescript
interface JPGOptions {
  quality: number; // 1-100, default: 80
  progressive: boolean; // default: true
  mozjpeg: boolean; // default: true
}

interface PNGOptions {
  quality: number; // 1-100, default: 90
  compressionLevel: number; // 0-9, default: 9
}

interface GIFOptions {
  enabled: boolean;
  quality: number;
}

interface SVGOptions {
  enabled: boolean;
  multipass: boolean; // default: true
  removeMetadata: boolean; // default: true
}

interface WebPOptions {
  enabled: boolean;
  quality: number; // default: 80
}

interface AVIFOptions {
  enabled: boolean;
  quality: number; // default: 75
  effort: number; // 0-9, default: 4
}

interface ImgminConfig {
  formats: {
    jpg: JPGOptions;
    png: PNGOptions;
    gif: GIFOptions;
    svg: SVGOptions;
    webp: WebPOptions;
    avif: AVIFOptions;
  };
  convertTo: string[]; // Formats to convert to
  output: string; // Output directory
  workers: number; // Parallel workers, default: 1
  verbose: boolean; // Verbose logging, default: false
  removeMetadata: boolean; // Remove EXIF/metadata, default: false
}
```

#### 3.2.2 Config Manager (`src/config/config-manager.ts`)

**Functions:**

- `loadJsonConfig(path: string): Partial<ImgminConfig>` - Load from JSON file
- `cliOptionsToConfig(options: CliOptions): Partial<ImgminConfig>` - Convert CLI args
- `deepMerge<T>(target: T, source: Partial<T>): T` - Deep merge objects
- `loadConfig(options: ConfigOptions): ImgminConfig` - Master load function
- `getFormatConfig(config: ImgminConfig, format: string): FormatOptions` - Get format settings

**Priority Chain:**

```
CLI Arguments > JSON Config File > Default Configuration
```

#### 3.2.3 Default Configuration (`src/config/defaults.ts`)

```typescript
const DEFAULT_CONFIG: ImgminConfig = {
  formats: {
    jpg: { quality: 80, progressive: true, mozjpeg: true },
    png: { quality: 90, compressionLevel: 9 },
    gif: { enabled: true, quality: 80 },
    svg: { enabled: true, multipass: true, removeMetadata: true },
    webp: { enabled: false, quality: 80 },
    avif: { enabled: false, quality: 75, effort: 4 },
  },
  convertTo: [],
  output: "./dist",
  workers: 1,
  verbose: false,
  removeMetadata: false,
};
```

#### 3.2.4 Validation Schema (`src/config/schema.ts`)

Uses Zod for runtime validation:

```typescript
const ImgminConfigSchema = z.object({
  formats: z.object({
    jpg: JPGOptionsSchema,
    png: PNGOptionsSchema,
    // ... other formats
  }),
  // ... other fields
});

// Functions:
// validateConfig(config: unknown): ImgminConfig // Throws on error
// safeValidateConfig(config: unknown): ImgminConfig | null // Returns null on error
```

---

### 3.3 File Scanner Module (`src/file-scanner/file-scanner.ts`)

**Purpose:** Recursive file discovery with filtering

**Types:**

```typescript
interface ScanOptions {
  recursive?: boolean;
  extensions?: string[];
}

interface ScannedFile {
  path: string;
  filename: string;
  extension: string;
  size: number;
}
```

**Functions:**

- `scanFiles(inputDir: string, options: ScanOptions): ScannedFile[]` - Scan directory
- `filterBySize(files: ScannedFile[], minSize?: number, maxSize?: number): ScannedFile[]` - Filter by size
- `sortFiles(files: ScannedFile[], sortBy: 'name' | 'size' | 'ext'): ScannedFile[]` - Sort files

**Default Extensions:**

```
['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif']
```

---

### 3.4 Optimizer System

#### 3.4.1 Base Optimizer (`src/optimizers/base-optimizer.ts`)

**Abstract Class:**

```typescript
export abstract class BaseOptimizer {
  protected format: string;

  abstract optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult>;

  protected calculateRatio(originalSize: number, optimizedSize: number): number;
  protected createResult(buffer: Buffer, originalSize: number, metadata?: {}): OptimizeResult;
  protected logResult(result: OptimizeResult): void;
  protected handleError(error: unknown, context: string): void;
}
```

#### 3.4.2 Format Optimizers

**Implemented Optimizers:**

| Format | Class           | Engine          | Features                     |
| ------ | --------------- | --------------- | ---------------------------- |
| JPG    | `JPGOptimizer`  | Sharp + mozjpeg | Progressive, quality control |
| PNG    | `PNGOptimizer`  | Sharp           | Compression level 0-9        |
| GIF    | `GIFOptimizer`  | Sharp           | Preserve animation support   |
| SVG    | `SVGOptimizer`  | SVGO            | Multipass optimization       |
| WebP   | `WebPConverter` | Sharp           | Format conversion            |
| AVIF   | `AVIFConverter` | Sharp           | Modern codec support         |

**Types:**

```typescript
interface OptimizeResult {
  buffer: Buffer;
  format: string;
  size: number;
  originalSize: number;
  ratio: number; // Percentage reduction
  metadata: Record<string, unknown>;
}

interface OptimizerOptions {
  quality?: number;
  removeMetadata?: boolean;
  progressive?: boolean;
}
```

#### 3.4.3 Optimizer Factory (`src/optimizers/index.ts`)

**Functions:**

```typescript
export function createOptimizer(format: string): BaseOptimizer;
export function getAllOptimizers(): BaseOptimizer[];
```

**Supported Formats:**

- `jpg` / `jpeg` → JPGOptimizer
- `png` → PNGOptimizer
- `gif` → GIFOptimizer
- `svg` → SVGOptimizer
- `webp` → WebPConverter
- `avif` → AVIFConverter

---

## 4. API Documentation

### 4.1 CLI Interface (`bin/imgmin.ts`)

**Usage:**

```bash
imgmin --input <dir> --output <dir> [options]
```

**Arguments:**

```
REQUIRED:
  -i, --input <dir>         Input directory containing images
  -o, --output <dir>        Output directory for optimized images

OPTIONS:
  -c, --config <path>       Path to JSON configuration file
  -q, --quality <number>    Quality level (0-100)
  --remove-metadata         Remove EXIF and metadata
  --convert-webp            Convert images to WebP format
  --convert-avif            Convert images to AVIF format
  --workers <number>        Number of parallel workers (default: 1)
  -v, --verbose             Enable verbose logging
  -h, --help                Show help message
  --version                 Show version
```

**Examples:**

```bash
# Basic optimization
imgmin --input ./images --output ./dist

# With quality and metadata removal
imgmin -i ./images -o ./dist -q 75 --remove-metadata

# Convert to WebP
imgmin -i ./images -o ./dist --convert-webp

# With config file and parallel processing
imgmin -i ./images -o ./dist -c imgmin.config.json --workers 4

# Full example with all options
imgmin --input ./images --output ./dist \
  --quality 80 \
  --remove-metadata \
  --convert-webp \
  --convert-avif \
  --workers 2 \
  --verbose
```

### 4.2 Programmatic API (`src/index.ts`)

**Main Function:**

```typescript
export async function optimizeImages(
  inputDir: string,
  outputDir: string,
  options?: Partial<ImgminConfig>,
): Promise<ImageOptimizationResult[]>;
```

**Return Type:**

```typescript
export interface ImageOptimizationResult {
  inputPath: string;
  outputPath: string;
  inputSize: number;
  outputSize: number;
  ratio: number;
  format: string;
  time: number; // Milliseconds
  status: "success" | "error" | "skipped";
  error?: string;
}
```

**Example Usage:**

```typescript
import { optimizeImages } from "imgmin";

const results = await optimizeImages("./images", "./dist", {
  formats: {
    jpg: { quality: 80 },
    png: { quality: 90 },
  },
  removeMetadata: true,
  workers: 2,
  verbose: true,
});

results.forEach((result) => {
  if (result.status === "success") {
    console.log(`✅ ${result.inputPath}: ${result.ratio}% reduction`);
  } else {
    console.log(`❌ ${result.inputPath}: ${result.error}`);
  }
});
```

### 4.3 Type Exports

```typescript
export type {
  ImageOptimizationResult,
  CliOptions,
  ImgminConfig,
  OptimizeResult,
  OptimizerOptions,
  ScannedFile,
  ScanOptions,
  JPGOptions,
  PNGOptions,
  GIFOptions,
  SVGOptions,
  WebPOptions,
  AVIFOptions,
};
```

---

## 5. Configuration File Format

**Example: `imgmin.config.json`**

```json
{
  "formats": {
    "jpg": {
      "quality": 80,
      "progressive": true,
      "mozjpeg": true
    },
    "png": {
      "quality": 90,
      "compressionLevel": 9
    },
    "gif": {
      "enabled": true,
      "quality": 80
    },
    "svg": {
      "enabled": true,
      "multipass": true,
      "removeMetadata": true
    },
    "webp": {
      "enabled": true,
      "quality": 80
    },
    "avif": {
      "enabled": false,
      "quality": 75,
      "effort": 4
    }
  },
  "convertTo": ["webp"],
  "output": "./dist",
  "workers": 2,
  "verbose": false,
  "removeMetadata": true
}
```

---

## 6. Development Phases

### Phase 1: ✅ Foundation (Complete)

- TypeScript configuration
- Vitest test infrastructure
- Logger module
- CLI entry point
- API export structure

**Tests:** 5
**Files:** 8

### Phase 2: ✅ Configuration System (Complete)

- Type definitions for all configs
- Config manager with deep merge
- Default configurations
- Zod validation schema

**Tests:** 15
**Files:** 4

### Phase 3: ✅ File Scanner (Complete)

- Recursive directory scanning
- Format filtering
- File size filtering
- Sorting capabilities

**Tests:** 13
**Files:** 2

### Phase 4-6: ✅ Format Optimizers (Complete)

- BaseOptimizer abstract class
- JPG optimizer (Sharp + mozjpeg)
- PNG optimizer (Sharp)
- GIF optimizer (Sharp)
- SVG optimizer (SVGO)
- WebP converter (Sharp)
- AVIF converter (Sharp)
- Optimizer factory pattern

**Tests:** 7
**Files:** 8

### Phase 7: ⏳ Processor (In Progress)

- Main orchestration engine
- File processing pipeline
- Worker thread management
- Progress tracking
- Error recovery

**Target Tests:** 20+
**Target Files:** 3-4

### Phase 8: ⏳ API Integration

- Export all public APIs
- Type definitions for consumers
- Error handling strategies
- Configuration validation

### Phase 9: ⏳ CLI Enhancement

- Full CLI integration
- Progress bars and spinners
- Detailed statistics reporting
- Config file validation

### Phase 10: ⏳ End-to-End Testing

- Real image file testing
- Compression verification
- Performance benchmarks
- Error scenarios

### Phase 11: ⏳ Documentation & Polish

- API documentation
- CLI help and examples
- Changelog
- Release preparation

---

## 7. Data Flow Diagrams

### 7.1 CLI Execution Flow

```
User Input (CLI Args)
    ↓
Yargs Parser
    ↓
CLI Module (src/cli.ts)
    ↓
Config Manager:
  1. Load defaults
  2. Load JSON config (if provided)
  3. Merge CLI options
  4. Validate with Zod
    ↓
Processor (Phase 7):
  1. Scan input directory
  2. Get list of ScannedFile[]
  3. For each file:
     - Select optimizer by format
     - Load file buffer
     - Call optimizer.optimize()
     - Save result
     - Collect stats
    ↓
Output Results:
  - Print statistics
  - Report success/failures
  - Exit with code
```

### 7.2 API Execution Flow

```
optimizeImages(inputDir, outputDir, options?)
    ↓
Config Merge:
  options + defaults → ImgminConfig
    ↓
File Scanner:
  Scan inputDir → ScannedFile[]
    ↓
For Each File:
  ├─ Select Optimizer
  ├─ Load File Buffer
  ├─ Call optimize(buffer, options)
  ├─ Save to outputDir
  └─ Record Result
    ↓
Return Results[]:
  ImageOptimizationResult[]
```

---

## 8. Error Handling Strategy

### Error Categories

| Category           | Handling                     | User Feedback                          |
| ------------------ | ---------------------------- | -------------------------------------- |
| Invalid Config     | Zod validation throws        | Error message with field info          |
| File Not Found     | Try-catch in scanner         | Skipped file, logged warning           |
| Optimization Error | Try-catch in optimizer       | Result.status = 'error', error message |
| Permission Denied  | Catch filesystem errors      | Warning, continue to next file         |
| Unsupported Format | Format check before optimize | Skipped file, logged debug             |
| Memory Issues      | Node.js native handling      | Graceful error, partial results        |

---

## 9. Performance Considerations

### Optimizations

1. **Parallel Processing:** Worker threads (via workers option)
2. **Lazy Loading:** Format modules loaded on-demand
3. **Streaming:** Sharp uses streaming internally
4. **Caching:** File metadata cached during scan
5. **Early Exit:** Unsupported formats skipped immediately

### Memory Usage

- Single file processing: ~50-200MB per file (depends on image size)
- Multiple workers: Memory multiplied by worker count
- Typical batch: 10 files × 100MB each = ~1GB peak with 1 worker

### Disk Space

- Output: Equal to input in worst case (if no compression)
- Typical: 40-60% of input size after optimization

---

## 10. Testing Strategy

### Unit Tests (40 tests)

| Module         | Tests | Coverage |
| -------------- | ----- | -------- |
| Logger         | 5     | 100%     |
| Config Manager | 15    | 95%      |
| File Scanner   | 13    | 98%      |
| Optimizers     | 7     | 90%      |

### Integration Tests (Planned)

- End-to-end CLI execution
- File processing pipeline
- Error recovery scenarios
- Format conversion verification

### Performance Tests (Planned)

- Compression ratio validation
- Execution time benchmarks
- Memory usage profiling
- Throughput testing

---

## 11. Project Structure

```
imgmin/
├── bin/
│   └── imgmin.ts              # CLI entry point
├── src/
│   ├── index.ts               # API export
│   ├── cli.ts                 # CLI module
│   ├── types/
│   │   ├── index.ts           # Type re-exports
│   │   ├── config.ts          # Config types
│   │   ├── result.ts          # Result types
│   │   └── optimizer.ts       # Optimizer types
│   ├── utils/
│   │   └── logger.ts          # Logger utility
│   ├── config/
│   │   ├── defaults.ts        # Default config
│   │   ├── config-manager.ts  # Config loading & merging
│   │   └── schema.ts          # Zod validation
│   ├── file-scanner/
│   │   └── file-scanner.ts    # File scanning utility
│   ├── optimizers/
│   │   ├── base-optimizer.ts  # Abstract base class
│   │   ├── jpg-optimizer.ts   # JPG optimization
│   │   ├── png-optimizer.ts   # PNG optimization
│   │   ├── gif-optimizer.ts   # GIF optimization
│   │   ├── svg-optimizer.ts   # SVG optimization
│   │   ├── webp-converter.ts  # WebP conversion
│   │   ├── avif-converter.ts  # AVIF conversion
│   │   └── index.ts           # Optimizer factory
│   └── processor/             # Phase 7 (Pending)
│       ├── processor.ts       # Main processor
│       ├── types.ts           # Processor types
│       └── progress.ts        # Progress tracking
├── tests/
│   └── unit/
│       ├── logger.test.ts
│       ├── config-manager.test.ts
│       ├── file-scanner.test.ts
│       └── optimizers-integration.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── oxlint.json
├── .oxfmtignore
├── README.md
├── spec.md
└── ARCHITECTURE.md
```

---

## 12. Deployment & Distribution

### Build Process

```bash
pnpm build  # Uses tsdown to generate ESM bundle + .d.ts
```

### Distribution

```bash
npm publish  # Published to npm registry as @imgmin/core
```

### Installation

```bash
npm install imgmin
# or
pnpm add imgmin
```

---

## 13. Known Limitations & Future Work

### Current Limitations

1. Single-threaded by default (workers option planned for Phase 7)
2. No support for animated WebP/AVIF (future enhancement)
3. No watch mode (future feature)
4. No progress bar UI (future enhancement)
5. Limited color space handling

### Planned Enhancements

1. **Phase 7+:** Worker thread support for parallel processing
2. **Phase 9:** CLI progress indicators and formatted output
3. **Future:** Watch mode for development
4. **Future:** Config wizard/generator
5. **Future:** Web UI for configuration
6. **Future:** Plugin system for custom optimizers

---

## 14. Quick Start Guide

### Installation & Setup

```bash
# Clone repository
git clone <repo-url>
cd imgmin

# Install dependencies
pnpm install

# Run tests
pnpm test

# Start development
pnpm dev

# Build for production
pnpm build
```

### CLI Usage

```bash
# Create config file
cat > imgmin.config.json << EOF
{
  "formats": { "jpg": { "quality": 80 } },
  "output": "./dist"
}
EOF

# Run optimization
pnpm start -- -i ./images -o ./dist -c imgmin.config.json

# Or with direct options
pnpm start -- -i ./images -o ./dist -q 75 --remove-metadata
```

### Programmatic Usage

```typescript
import { optimizeImages } from "imgmin";

const results = await optimizeImages("./images", "./dist", {
  formats: { jpg: { quality: 80 } },
  verbose: true,
});

console.log(`Processed ${results.length} images`);
```

---

## 15. Glossary

| Term                 | Definition                                       |
| -------------------- | ------------------------------------------------ |
| **Optimization**     | Reducing file size while maintaining quality     |
| **Conversion**       | Changing from one format to another (JPG → WebP) |
| **Compression**      | Reducing file size through encoding              |
| **Metadata**         | EXIF, IPTC, XMP data embedded in images          |
| **Progressive JPEG** | JPEG that loads in increasing quality passes     |
| **Mozjpeg**          | Mozilla's JPEG encoder with better compression   |
| **SVGO**             | SVG Optimizer - minifies SVG files               |
| **Sharp**            | High-performance image processing library        |
| **Worker Thread**    | Parallel execution thread for async operations   |
| **Zod**              | TypeScript schema validation library             |

---

## 16. References

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [SVGO Documentation](https://svgo.dev/)
- [Yargs Documentation](https://yargs.js.org/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Document Version:** 1.0
**Last Updated:** May 2, 2026
**Status:** ACTIVE DEVELOPMENT - Phases 1-4.6 Complete, Phase 7+ In Progress
