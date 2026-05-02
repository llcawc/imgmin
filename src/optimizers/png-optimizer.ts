/**
 * PNG Optimizer using Sharp
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import sharp from 'sharp'

import { BaseOptimizer } from './base-optimizer'

export class PNGOptimizer extends BaseOptimizer {
  constructor() {
    super('PNG')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length
    const quality = options.quality ?? 90

    try {
      // Optimize PNG using Sharp
      let pipeline = sharp(buffer)

      // Apply PNG optimization
      const optimizedBuffer = await pipeline
        .png({
          quality: Math.min(Math.round((quality / 100) * 100), 100),
          progressive: true,
          compressionLevel: 9,
        })
        .toBuffer()

      const result = this.createResult(optimizedBuffer, originalSize, {
        quality,
        progressive: true,
        compressionLevel: 9,
      })

      this.logResult(result)
      return result
    } catch (error) {
      this.handleError(error, 'PNG optimization')
      throw error
    }
  }
}

export default PNGOptimizer
