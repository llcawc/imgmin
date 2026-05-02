# API Documentation

Complete reference for the imgmin programmatic API.

## Table of Contents

1. [Installation](#installation)
2. [Core Functions](#core-functions)
3. [Types](#types)
4. [Examples](#examples)
5. [Error Handling](#error-handling)
6. [Advanced Usage](#advanced-usage)

## Installation

```bash
npm install imgmin
# or
pnpm add imgmin
```

## Core Functions

### `optimizeImages()`

Main function to optimize images in a directory.

**Signature:**

```typescript
export async function optimizeImages(
  inputDir: string,
  outputDir: string,
  options?: Partial<CliOptions>,
  onProgress?: (progress: ProcessingProgress) => void,
  onError?: (error: Error) => void,
): Promise<ImageOptimizationResult[]>;
```

**Parameters:**

- `inputDir` (string) - Path to input directory containing images
- `outputDir` (string) - Path to output directory for optimized images
- `options` (Partial<CliOptions>, optional) - Configuration options
- `onProgress` (callback, optional) - Progress tracking callback
- `onError` (callback, optional) - Error handling callback

**Returns:** Array of ImageOptimizationResult objects

**Example:**

```typescript
import { optimizeImages } from "imgmin";

const results = await optimizeImages("./source/images", "./dist/images");

console.log(`Processed ${results.length} images`);
```

---

### `getDefaultConfig()`

Get the default configuration object.

**Signature:**

```typescript
export function getDefaultConfig(): ImgminConfig;
```

**Returns:** Default configuration with all format-specific settings

**Example:**

```typescript
import { getDefaultConfig } from "imgmin";

const config = getDefaultConfig();
console.log(config.formats.jpg.quality); // 80
```

---

### `scanImages()`

Scan a directory for image files.

**Signature:**

```typescript
export async function scanImages(directory: string, recursive?: boolean): Promise<ScannedFile[]>;
```

**Parameters:**

- `directory` (string) - Directory to scan
- `recursive` (boolean, optional) - Scan subdirectories (default: true)

**Returns:** Array of ScannedFile objects

**Example:**

```typescript
import { scanImages } from "imgmin";

const files = await scanImages("./images", true);
console.log(`Found ${files.length} images`);
```

---

## Types

### `ImageOptimizationResult`

Result of processing a single image.

```typescript
interface ImageOptimizationResult {
  inputPath: string; // Original file path
  outputPath: string; // Optimized file path
  inputSize: number; // Original file size (bytes)
  outputSize: number; // Optimized file size (bytes)
  ratio: number; // outputSize / inputSize
  format: string; // Image format (jpg, png, gif, svg, webp, avif)
  time: number; // Processing time (milliseconds)
  status: "success" | "error" | "skipped";
  error?: string; // Error message if failed
}
```

**Example:**

```typescript
{
  inputPath: './images/photo.jpg',
  outputPath: './optimized/photo.jpg',
  inputSize: 2048576,
  outputSize: 1024288,
  ratio: 0.5,
  format: 'jpg',
  time: 245.5,
  status: 'success'
}
```

---

### `CliOptions`

Configuration options for image optimization.

```typescript
interface CliOptions {
  input?: string; // Input directory
  output?: string; // Output directory
  config?: string; // Config file path
  quality?: number; // Quality level (0-100)
  removeMetadata?: boolean; // Remove EXIF/profiles
  convertWebp?: boolean; // Convert to WebP
  convertAvif?: boolean; // Convert to AVIF
  workers?: number; // Parallel workers
  verbose?: boolean; // Verbose logging
  dryRun?: boolean; // Dry run mode
}
```

---

### `ProcessingProgress`

Progress information during processing.

```typescript
interface ProcessingProgress {
  current: number; // Current file index
  total: number; // Total files
  percentage: number; // Progress percentage (0-100)
  status: string; // Current status message
}
```

---

### `ImgminConfig`

Complete configuration structure.

```typescript
interface ImgminConfig {
  formats: {
    jpg: JpgOptions;
    png: PngOptions;
    gif: GifOptions;
    svg: SvgOptions;
  };
  convertTo: {
    webp: WebpOptions;
    avif: AvifOptions;
  };
  output: OutputOptions;
  workers: number;
  verbose: boolean;
}
```

---

### Format-Specific Options

#### `JpgOptions`

```typescript
{
  quality: number; // 0-100
  progressive: boolean; // Progressive JPEG
  removeMetadata: boolean; // Remove EXIF
  chromaSubsampling: "4:4:4" | "4:2:0"; // Chroma subsampling
}
```

#### `PngOptions`

```typescript
{
  compressionLevel: number; // 0-9
  progressive: boolean; // Interlaced PNG
  removeMetadata: boolean; // Remove metadata
}
```

#### `GifOptions`

```typescript
{
  optimizationLevel: number; // 0-3
  removeMetadata: boolean; // Remove metadata
}
```

#### `SvgOptions`

```typescript
{
  minify: boolean; // Minify SVG
}
```

#### `WebpOptions`

```typescript
{
  enabled: boolean; // Enable conversion
  quality: number; // 0-100
}
```

#### `AvifOptions`

```typescript
{
  enabled: boolean; // Enable conversion
  quality: number; // 0-100
}
```

---

## Examples

### Basic Usage

```typescript
import { optimizeImages } from "imgmin";

async function main() {
  const results = await optimizeImages("./images", "./optimized");

  console.log(`Successfully processed ${results.length} images`);
}

main();
```

### With Configuration

```typescript
import { optimizeImages, getDefaultConfig } from "imgmin";

async function main() {
  const config = getDefaultConfig();

  // Customize config
  config.formats.jpg.quality = 85;
  config.formats.png.compressionLevel = 9;

  const results = await optimizeImages("./images", "./optimized", config);

  console.log("Optimization complete!");
}

main();
```

### With Progress Tracking

```typescript
import { optimizeImages } from "imgmin";
import type { ProcessingProgress } from "imgmin";

async function main() {
  const results = await optimizeImages(
    "./images",
    "./optimized",
    { verbose: false },
    (progress: ProcessingProgress) => {
      console.log(`[${progress.percentage}%] ${progress.status}`);
    },
    (error: Error) => {
      console.error(`Error: ${error.message}`);
    },
  );

  console.log(`Processed ${results.length} images`);
}

main();
```

### Analyzing Results

```typescript
import { optimizeImages } from "imgmin";

async function main() {
  const results = await optimizeImages("./images", "./optimized");

  // Calculate statistics
  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "error");

  const totalInput = successful.reduce((sum, r) => sum + r.inputSize, 0);
  const totalOutput = successful.reduce((sum, r) => sum + r.outputSize, 0);
  const saved = totalInput - totalOutput;
  const percent = totalInput > 0 ? ((saved / totalInput) * 100).toFixed(2) : 0;

  console.log("📊 Results:");
  console.log(`✅ Success: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`💾 Saved: ${formatBytes(saved)} (${percent}%)`);

  // Show slowest processed files
  const slowest = successful.sort((a, b) => b.time - a.time).slice(0, 3);

  console.log("\n⏱️  Slowest files:");
  for (const result of slowest) {
    console.log(`${result.inputPath}: ${result.time.toFixed(0)}ms`);
  }
}

function formatBytes(bytes) {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

main();
```

### Format Conversion

```typescript
import { optimizeImages } from "imgmin";

async function convertToWebP() {
  const results = await optimizeImages("./images", "./images-webp", {
    convertWebp: true,
    quality: 80,
  });

  const webpFiles = results.filter((r) => r.outputPath.endsWith(".webp"));
  console.log(`Converted ${webpFiles.length} files to WebP`);
}

convertToWebP();
```

### Batch Processing with Filtering

```typescript
import { scanImages, optimizeImages } from "imgmin";

async function processLargeFiles() {
  // Scan for images
  const files = await scanImages("./images", true);

  // Filter large files (> 1MB)
  const largeFiles = files.filter((f) => f.size > 1024 * 1024);

  console.log(`Found ${largeFiles.length} large files to optimize`);

  // Process
  const results = await optimizeImages("./images", "./optimized", {
    quality: 75, // Lower quality for large files
  });

  const processed = results.filter((r) => r.status === "success");
  console.log(`Processed ${processed.length} files`);
}

processLargeFiles();
```

---

## Error Handling

### Handling Errors

```typescript
import { optimizeImages } from "imgmin";

async function main() {
  try {
    const results = await optimizeImages("./images", "./optimized", {}, undefined, (error: Error) => {
      console.error(`Processing error: ${error.message}`);
    });

    // Check for individual errors
    const errors = results.filter((r) => r.status === "error");
    if (errors.length > 0) {
      console.error(`${errors.length} files failed:`);
      for (const error of errors) {
        console.error(`  ${error.inputPath}: ${error.error}`);
      }
    }
  } catch (error) {
    console.error("Fatal error:", error);
  }
}

main();
```

### Error Types

Common errors you may encounter:

- **"Input directory does not exist"** - Check the input path
- **"Output directory creation failed"** - Check permissions
- **"Unsupported image format"** - Only .jpg, .png, .gif, .svg, .webp, .avif are supported
- **"Invalid configuration"** - Check config file format
- **"Processing failed"** - See error message for details

---

## Advanced Usage

### Custom Configuration File

Create `imgmin.config.json`:

```json
{
  "formats": {
    "jpg": {
      "quality": 80,
      "progressive": true,
      "removeMetadata": true,
      "chromaSubsampling": "4:2:0"
    },
    "png": {
      "compressionLevel": 9,
      "progressive": false,
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
    "webp": {
      "enabled": true,
      "quality": 80
    },
    "avif": {
      "enabled": false,
      "quality": 60
    }
  },
  "workers": 1,
  "verbose": false
}
```

Use it in code:

```typescript
import { optimizeImages } from "imgmin";
import config from "./imgmin.config.json" assert { type: "json" };

const results = await optimizeImages("./images", "./optimized", config);
```

### Monitoring and Logging

```typescript
import { optimizeImages, logger } from "imgmin";

async function main() {
  logger.setVerbose(true);

  const results = await optimizeImages("./images", "./optimized", { verbose: true }, (progress) => {
    logger.info(`Processed: ${progress.current}/${progress.total}`);
  });
}

main();
```

### Dry-Run Mode

Test optimization without writing files:

```typescript
import { optimizeImages } from "imgmin";

async function testOptimization() {
  const results = await optimizeImages(
    "./images",
    "./optimized",
    { dryRun: true }, // No files will be written
  );

  console.log("What would be optimized:");
  for (const result of results) {
    const saved = result.inputSize - result.outputSize;
    console.log(`${result.inputPath}: ${saved} bytes saved`);
  }
}

testOptimization();
```

---

## Performance Tips

1. **Quality Settings** - Lower quality = smaller file size but less visual fidelity
2. **Format Selection** - WebP/AVIF offer better compression than JPG/PNG
3. **Batch Size** - Process in smaller batches to reduce memory usage
4. **Workers** - Increase workers for parallel processing (if using multiple workers)

---

## See Also

- [README](./README.md) - Project overview and CLI usage
- [CHANGELOG](./CHANGELOG.md) - Version history
- [Configuration](./README.md#configuration-file) - Config file format
