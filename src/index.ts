/**
 * imgmin - Image optimization API
 * Main entry point for programmatic usage (TypeScript)
 */

import type { ProcessingProgress } from './processor/types.ts'
import type { ImageOptimizationResult, CliOptions } from './types/index.ts'

import { loadConfig } from './config/config-manager.ts'
import { getAllDefaults } from './config/defaults.ts'
import { scanFiles } from './file-scanner/file-scanner.ts'
import { Processor } from './processor/processor.ts'
import logger from './utils/logger.ts'

/**
 * Main API function to optimize images in a directory
 * @param inputDir - Input directory path
 * @param outputDir - Output directory path
 * @param options - Configuration options
 * @param onProgress - Optional progress callback
 * @param onError - Optional error callback
 * @returns Array of processing results
 *
 * @example
 * ```typescript
 * import { optimizeImages } from 'imgmin'
 *
 * const results = await optimizeImages('./images', './optimized', {
 *   quality: 80,
 *   verbose: true
 * })
 * ```
 */
export async function optimizeImages(
  inputDir: string,
  outputDir: string,
  options: Partial<CliOptions> = {},
  onProgress?: (progress: ProcessingProgress) => void,
  onError?: (error: Error) => void,
): Promise<ImageOptimizationResult[]> {
  logger.info('📦 API: optimizeImages() called')
  logger.info(`Input: ${inputDir}`)
  logger.info(`Output: ${outputDir}`)

  // Load configuration
  const config = await loadConfig(inputDir, outputDir, options as any)

  // Create processor instance
  const processor = new Processor(inputDir, outputDir, config, onProgress, onError)

  // Process images
  return processor.process()
}

/**
 * Get default configuration
 * @returns Default configuration object
 *
 * @example
 * ```typescript
 * import { getDefaultConfig } from 'imgmin'
 *
 * const config = getDefaultConfig()
 * ```
 */
export function getDefaultConfig() {
  return getAllDefaults()
}

/**
 * Scan directory for image files
 * @param directory - Directory path
 * @param recursive - Scan recursively
 * @returns Array of scanned files
 */
export async function scanImages(directory: string, recursive = true) {
  return scanFiles(directory, { recursive })
}

// Type exports
export type { ImageOptimizationResult, CliOptions } from './types/index.ts'
export type { ProcessingProgress, ProcessingStats, ProcessorOptions } from './processor/types.ts'

// Component exports
export { Processor, processImages as processImagesLow } from './processor/processor.ts'
export { loadConfig } from './config/config-manager.ts'
export { scanFiles } from './file-scanner/file-scanner.ts'
export { logger }

// Config type exports
export type {
  ImageminConfig,
  JpgOptions,
  PngOptions,
  GifOptions,
  SvgOptions,
  WebpOptions,
  AvifOptions,
} from './types/config.ts'

// Optimizer type exports
export type { OptimizeResult, OptimizerOptions, OptimizeStats } from './types/optimizer.ts'

// Result type exports
export type { OptimizationResult } from './types/result.ts'

// Default export
export default {
  optimizeImages,
  getDefaultConfig,
  scanImages,
  logger,
}
