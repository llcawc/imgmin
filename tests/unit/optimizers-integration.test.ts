/**
 * Optimizers Integration Test
 */

import { describe, it, expect } from 'vitest'

describe('Optimizers Module', () => {
  it('should export all optimizer classes from optimizers index', async () => {
    // Dynamic import to avoid module resolution issues
    const optimizersModule = await import('../../src/optimizers/index.ts')

    expect(optimizersModule.BaseOptimizer).toBeDefined()
    expect(optimizersModule.JPGOptimizer).toBeDefined()
    expect(optimizersModule.PNGOptimizer).toBeDefined()
    expect(optimizersModule.GIFOptimizer).toBeDefined()
    expect(optimizersModule.SVGOptimizer).toBeDefined()
    expect(optimizersModule.WebPConverter).toBeDefined()
    expect(optimizersModule.AVIFConverter).toBeDefined()
  })

  it('should have createOptimizer function', async () => {
    const { createOptimizer } = await import('../../src/optimizers/index.ts')

    expect(typeof createOptimizer).toBe('function')
  })

  it('should have getAllOptimizers function', async () => {
    const { getAllOptimizers } = await import('../../src/optimizers/index.ts')

    expect(typeof getAllOptimizers).toBe('function')
  })

  it('should create optimizer instances with createOptimizer', async () => {
    const { createOptimizer } = await import('../../src/optimizers/index.ts')

    const jpgOpt = createOptimizer('jpg')
    expect(jpgOpt).toBeDefined()
    expect(jpgOpt.getName()).toContain('Optimizer')

    const pngOpt = createOptimizer('png')
    expect(pngOpt).toBeDefined()

    const gifOpt = createOptimizer('gif')
    expect(gifOpt).toBeDefined()

    const svgOpt = createOptimizer('svg')
    expect(svgOpt).toBeDefined()

    const webpOpt = createOptimizer('webp')
    expect(webpOpt).toBeDefined()

    const avifOpt = createOptimizer('avif')
    expect(avifOpt).toBeDefined()
  })

  it('should return all 6 optimizers from getAllOptimizers', async () => {
    const { getAllOptimizers } = await import('../../src/optimizers/index.ts')

    const optimizers = getAllOptimizers()
    expect(optimizers).toHaveLength(6)
  })

  it('should throw error for unsupported format', async () => {
    const { createOptimizer } = await import('../../src/optimizers/index.ts')

    expect(() => createOptimizer('bmp')).toThrow('Unsupported format')
    expect(() => createOptimizer('tiff')).toThrow('Unsupported format')
  })

  it('should be case insensitive for format selection', async () => {
    const { createOptimizer } = await import('../../src/optimizers/index.ts')

    const opt1 = createOptimizer('jpg')
    const opt2 = createOptimizer('JPG')
    const opt3 = createOptimizer('Jpg')

    expect(opt1.getName()).toBe(opt2.getName())
    expect(opt2.getName()).toBe(opt3.getName())
  })
})
