/**
 * Optimizers index
 */

export { BaseOptimizer } from './base-optimizer'
export { JPGOptimizer } from './jpg-optimizer'
export { PNGOptimizer } from './png-optimizer'
export { GIFOptimizer } from './gif-optimizer'
export { SVGOptimizer } from './svg-optimizer'
export { WebPConverter } from './webp-converter'
export { AVIFConverter } from './avif-converter'

import { AVIFConverter } from './avif-converter'
import { GIFOptimizer } from './gif-optimizer'
import { JPGOptimizer } from './jpg-optimizer'
import { PNGOptimizer } from './png-optimizer'
import { SVGOptimizer } from './svg-optimizer'
import { WebPConverter } from './webp-converter'

/**
 * Create optimizer instance by format
 */
export function createOptimizer(format: string) {
  const upperFormat = format.toUpperCase()

  switch (upperFormat) {
    case 'JPG':
    case 'JPEG':
      return new JPGOptimizer()
    case 'PNG':
      return new PNGOptimizer()
    case 'GIF':
      return new GIFOptimizer()
    case 'SVG':
      return new SVGOptimizer()
    case 'WEBP':
      return new WebPConverter()
    case 'AVIF':
      return new AVIFConverter()
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

/**
 * Get all optimizer instances
 */
export function getAllOptimizers() {
  return [
    new JPGOptimizer(),
    new PNGOptimizer(),
    new GIFOptimizer(),
    new SVGOptimizer(),
    new WebPConverter(),
    new AVIFConverter(),
  ]
}

export default {
  createOptimizer,
  getAllOptimizers,
}
