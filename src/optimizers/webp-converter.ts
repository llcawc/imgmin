/**
 * WebP Converter using Sharp
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import sharp from 'sharp'

import { BaseOptimizer } from './base-optimizer'

export class WebPConverter extends BaseOptimizer {
  constructor() {
    super('WebP')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length
    const quality = options.quality ?? 80

    try {
      // Convert to WebP using Sharp
      let pipeline = sharp(buffer)

      // Convert to WebP
      const optimizedBuffer = await pipeline
        .webp({
          quality,
          alphaQuality: quality,
        })
        .toBuffer()

      const result = this.createResult(optimizedBuffer, originalSize, {
        quality,
        format: 'WebP',
        alphaSupport: true,
      })

      this.logResult(result)
      return result
    } catch (error) {
      this.handleError(error, 'WebP conversion')
      throw error
    }
  }
}

export default WebPConverter
