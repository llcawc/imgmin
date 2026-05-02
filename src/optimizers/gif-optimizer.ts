/**
 * GIF Optimizer using Sharp
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import sharp from 'sharp'

import { BaseOptimizer } from './base-optimizer'

export class GIFOptimizer extends BaseOptimizer {
  constructor() {
    super('GIF')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length

    try {
      // Analyze GIF with Sharp
      let pipeline = sharp(buffer)

      // Extract metadata
      const metadata = await sharp(buffer).metadata()

      // For GIF, we'll transcode it which can reduce size
      // We preserve animation if it exists
      const optimizedBuffer = await pipeline.gif().toBuffer()

      const result = this.createResult(optimizedBuffer, originalSize, {
        isAnimated: metadata.hasAlpha ?? false,
        pages: metadata.pages ?? 1,
      })

      this.logResult(result)
      return result
    } catch (error) {
      this.handleError(error, 'GIF optimization')
      throw error
    }
  }
}

export default GIFOptimizer
