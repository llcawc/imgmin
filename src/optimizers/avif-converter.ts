/**
 * AVIF Converter using Sharp
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import sharp from 'sharp'

import { BaseOptimizer } from './base-optimizer'

export class AVIFConverter extends BaseOptimizer {
  constructor() {
    super('AVIF')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length
    const quality = options.quality ?? 75

    try {
      // Convert to AVIF using Sharp
      let pipeline = sharp(buffer)

      // Convert to AVIF
      const optimizedBuffer = await pipeline
        .avif({
          quality,
          lossless: false,
          effort: 4,
        })
        .toBuffer()

      const result = this.createResult(optimizedBuffer, originalSize, {
        quality,
        format: 'AVIF',
        lossless: false,
        effort: 4,
      })

      this.logResult(result)
      return result
    } catch (error) {
      this.handleError(error, 'AVIF conversion')
      throw error
    }
  }
}

export default AVIFConverter
