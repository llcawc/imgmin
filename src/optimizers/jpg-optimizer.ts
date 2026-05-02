/**
 * JPG Optimizer using Sharp
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import sharp from 'sharp'

import { BaseOptimizer } from './base-optimizer'

export class JPGOptimizer extends BaseOptimizer {
  constructor() {
    super('JPG')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length
    const quality = options.quality ?? 80
    const progressive = options.progressive ?? true

    try {
      // Optimize JPG using Sharp
      let pipeline = sharp(buffer)

      // Apply JPEG optimization
      const optimizedBuffer = await pipeline
        .jpeg({
          quality,
          progressive,
          mozjpeg: true,
        })
        .toBuffer()

      const result = this.createResult(optimizedBuffer, originalSize, {
        quality,
        progressive,
        mozjpeg: true,
      })

      this.logResult(result)
      return result
    } catch (error) {
      this.handleError(error, 'JPG optimization')
      throw error
    }
  }
}

export default JPGOptimizer
