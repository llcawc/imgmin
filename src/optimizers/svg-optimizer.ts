/**
 * SVG Optimizer using SVGO
 */

import type { OptimizeResult, OptimizerOptions } from '../types/optimizer'

import { optimize as svgoOptimize } from 'svgo'

import { BaseOptimizer } from './base-optimizer'

export class SVGOptimizer extends BaseOptimizer {
  constructor() {
    super('SVG')
  }

  async optimize(buffer: Buffer, options: OptimizerOptions): Promise<OptimizeResult> {
    const originalSize = buffer.length
    const svgString = buffer.toString('utf-8')

    try {
      // Optimize SVG using SVGO
      const result = svgoOptimize(svgString, {
        multipass: true,
        plugins: ['preset-default'],
      })

      if (!result.data) {
        throw new Error('SVGO optimization failed')
      }

      const optimizedBuffer = Buffer.from(result.data, 'utf-8')
      const optResult = this.createResult(optimizedBuffer, originalSize, {
        multipass: true,
        preserveViewBox: true,
      })

      this.logResult(optResult)
      return optResult
    } catch (error) {
      this.handleError(error, 'SVG optimization')
      throw error
    }
  }
}

export default SVGOptimizer
