/**
 * Base Optimizer class
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import logger from '../utils/logger'

export abstract class BaseOptimizer {
  protected format: string

  constructor(format: string) {
    this.format = format
  }

  /**
   * Main optimize method - must be implemented by subclasses
   */
  abstract optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult>

  /**
   * Get optimizer name
   */
  getName(): string {
    return `${this.format} Optimizer`
  }

  /**
   * Calculate compression ratio
   */
  protected calculateRatio(originalSize: number, optimizedSize: number): number {
    if (originalSize === 0) {
      return 0
    }
    return Math.round((1 - optimizedSize / originalSize) * 10000) / 100
  }

  /**
   * Create optimize result object
   */
  protected createResult(buffer: Buffer, originalSize: number, metadata: Record<string, unknown> = {}): OptimizeResult {
    const size = buffer.length
    const ratio = this.calculateRatio(originalSize, size)

    return {
      buffer,
      format: this.format,
      size,
      originalSize,
      ratio,
      metadata: {
        ...metadata,
        optimizer: this.getName(),
      },
    }
  }

  /**
   * Log optimization result
   */
  protected logResult(result: OptimizeResult): void {
    logger.info(`✅ ${this.format}: ${result.originalSize} → ${result.size} bytes (${result.ratio}% reduction)`)
  }

  /**
   * Handle optimization error
   */
  protected handleError(error: unknown, context: string): void {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`❌ ${this.format} optimization error (${context}): ${message}`)
  }
}

export default BaseOptimizer
