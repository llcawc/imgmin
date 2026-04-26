/**
 * imgmin - Image optimization API
 * Main entry point for programmatic usage (TypeScript)
 */

import type { ImageOptimizationResult, CliOptions } from './types/index.js'

import logger from './utils/logger.js'

/**
 * Optimize images in a directory
 * @param options - Configuration options
 * @returns Array of processing results
 */
export async function optimizeImages(options: Partial<CliOptions> = {}): Promise<ImageOptimizationResult[]> {
  logger.info('📦 API: optimizeImages() called')
  logger.info(`Input: ${options.input ?? 'undefined'}`)
  logger.info(`Output: ${options.output ?? 'undefined'}`)

  // Placeholder implementation
  return [
    {
      inputPath: 'placeholder',
      outputPath: 'placeholder',
      inputSize: 0,
      outputSize: 0,
      ratio: 0,
      format: 'unknown',
      time: 0,
      status: 'pending',
    },
  ]
}

export type { ImageOptimizationResult, CliOptions } from './types/index.js'
export default { optimizeImages }
