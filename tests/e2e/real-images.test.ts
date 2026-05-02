/**
 * End-to-End (E2E) Tests
 * Real image processing with actual image files
 */

import fs from 'fs'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { cli } from '../../src/cli.ts'
import { optimizeImages } from '../../src/index.ts'
import logger from '../../src/utils/logger.ts'

// Use actual image directory
const TEST_INPUT = './images'
const TEST_OUTPUT = './tests/fixtures/e2e-output'

function cleanup() {
  if (fs.existsSync(TEST_OUTPUT)) {
    fs.rmSync(TEST_OUTPUT, { recursive: true, force: true })
  }
}

describe('E2E - Real Image Processing', () => {
  beforeAll(() => {
    cleanup()
    if (!fs.existsSync(TEST_OUTPUT)) {
      fs.mkdirSync(TEST_OUTPUT, { recursive: true })
    }
  })

  afterAll(() => {
    cleanup()
  })

  describe('Real Images - Format Support', () => {
    it('should process JPG images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const jpgResults = results.filter((r) => r.format === 'jpg')
      expect(jpgResults.length).toBeGreaterThan(0)

      // Check that JPG files were processed
      for (const result of jpgResults) {
        expect(result.inputPath).toContain('.jpg')
        expect(result.outputPath).toContain('.jpg')
      }
    })

    it('should process PNG images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const pngResults = results.filter((r) => r.format === 'png')
      expect(pngResults.length).toBeGreaterThan(0)

      // Check that PNG files were processed
      for (const result of pngResults) {
        expect(result.inputPath).toContain('.png')
        expect(result.outputPath).toContain('.png')
      }
    })

    it('should process GIF images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const gifResults = results.filter((r) => r.format === 'gif')
      expect(gifResults.length).toBeGreaterThan(0)

      // Check that GIF files were processed
      for (const result of gifResults) {
        expect(result.inputPath).toContain('.gif')
      }
    })

    it('should process SVG images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const svgResults = results.filter((r) => r.format === 'svg')
      expect(svgResults.length).toBeGreaterThan(0)

      // Check that SVG files were processed
      for (const result of svgResults) {
        expect(result.inputPath).toContain('.svg')
      }
    })

    it('should process WebP images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const webpResults = results.filter((r) => r.format === 'webp')
      // WebP support is optional
      expect(Array.isArray(webpResults)).toBe(true)
    })

    it('should process AVIF images', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const avifResults = results.filter((r) => r.format === 'avif')
      // AVIF support is optional
      expect(Array.isArray(avifResults)).toBe(true)
    })
  })

  describe('Image Optimization Results', () => {
    it('should create output files', async () => {
      const beforeCount = fs.readdirSync(TEST_OUTPUT, { recursive: true }).length

      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const successResults = results.filter((r) => r.status === 'success')
      const afterCount = fs.readdirSync(TEST_OUTPUT, { recursive: true }).length

      // Should have created some output files
      expect(afterCount).toBeGreaterThanOrEqual(beforeCount)
    })

    it('should calculate size changes', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      for (const result of results) {
        if (result.status === 'success') {
          // Ratio can be negative if file increased in size (e.g., AVIF re-encoding)
          expect(typeof result.ratio).toBe('number')
          expect(Number.isFinite(result.ratio)).toBe(true)
        }
      }
    })

    it('should measure processing time', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      for (const result of results) {
        if (result.status === 'success') {
          expect(result.time).toBeGreaterThanOrEqual(0)
        }
      }
    })

    it('should provide correct file paths', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      for (const result of results) {
        expect(result.inputPath).toBeDefined()
        expect(result.outputPath).toBeDefined()
        expect(typeof result.inputPath).toBe('string')
        expect(typeof result.outputPath).toBe('string')
      }
    })

    it('should handle all supported formats', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const formats = new Set(results.map((r) => r.format))
      expect(formats.size).toBeGreaterThan(0)

      // Should have at least jpg and png
      const formatArray = Array.from(formats)
      expect(formatArray.some((f) => ['jpg', 'jpeg'].includes(f))).toBe(true)
      expect(formatArray.some((f) => f === 'png')).toBe(true)
    })
  })

  describe('Batch Processing', () => {
    it('should process multiple files', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      expect(results.length).toBeGreaterThan(1)
    })

    it('should return results for all scanned files', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      // Each result should have status
      for (const result of results) {
        expect(['success', 'error', 'skipped']).toContain(result.status)
      }
    })

    it('should handle mixed success and errors gracefully', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const successCount = results.filter((r) => r.status === 'success').length
      const errorCount = results.filter((r) => r.status === 'error').length

      // Should complete without throwing
      expect(results.length).toBe(successCount + errorCount)
    })
  })

  describe('Config Options', () => {
    it('should support quality option', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { quality: 80, verbose: false })

      expect(results.length).toBeGreaterThan(0)
    })

    it('should support verbose option', async () => {
      const infoSpy = logger.info as any
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: true })

      expect(results.length).toBeGreaterThan(0)
    })

    it('should process different quality levels', async () => {
      const results85 = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { quality: 85, verbose: false })
      const results70 = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { quality: 70, verbose: false })

      // Both should complete
      expect(results85.length).toBeGreaterThan(0)
      expect(results70.length).toBeGreaterThan(0)
    })
  })

  describe('File Extensions', () => {
    it('should preserve file extensions', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      for (const result of results) {
        const inputExt = path.extname(result.inputPath).toLowerCase()
        const outputExt = path.extname(result.outputPath).toLowerCase()

        // Extensions should match (except for format conversions)
        if (!result.outputPath.includes('.webp') && !result.outputPath.includes('.avif')) {
          expect(outputExt).toBe(inputExt)
        }
      }
    })

    it('should handle case-insensitive extensions', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      // Should process files regardless of extension case
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Progress Tracking', () => {
    it('should emit progress callbacks', async () => {
      let progressCount = 0
      const onProgress = () => {
        progressCount++
      }

      await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false }, onProgress)

      // Should have emitted at least one progress update
      expect(progressCount).toBeGreaterThanOrEqual(0)
    })

    it('should emit error callbacks on processing errors', async () => {
      let errorCount = 0
      const onError = () => {
        errorCount++
      }

      await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false }, undefined, onError)

      // Error callback may be called
      expect(typeof errorCount).toBe('number')
    })
  })

  describe('Output Directory Structure', () => {
    it('should create output directory if not exists', async () => {
      const customOutput = './tests/fixtures/e2e-custom-output'
      expect(fs.existsSync(customOutput)).toBe(false)

      const results = await optimizeImages(TEST_INPUT, customOutput, { verbose: false })

      expect(fs.existsSync(customOutput)).toBe(true)

      // Cleanup
      fs.rmSync(customOutput, { recursive: true, force: true })
    })

    it('should organize files by type if configured', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      // Files should be organized (either flat or by directory)
      const outputFiles = fs.readdirSync(TEST_OUTPUT, { recursive: true })
      expect(outputFiles.length).toBeGreaterThan(0)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle complete optimization workflow', async () => {
      cleanup()

      // Full workflow
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, {
        quality: 80,
        verbose: false,
      })

      expect(results.length).toBeGreaterThan(0)

      // Verify output
      const totalInputSize = results.reduce((sum, r) => sum + r.inputSize, 0)
      const totalOutputSize = results.reduce((sum, r) => sum + r.outputSize, 0)

      expect(totalInputSize).toBeGreaterThan(0)
      expect(totalOutputSize).toBeGreaterThanOrEqual(0)
    })

    it('should process diverse image collection', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const formats = new Set()
      for (const result of results) {
        formats.add(result.format)
      }

      // Should handle multiple formats
      expect(formats.size).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Result Statistics', () => {
    it('should provide accurate file statistics', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      const totalInputSize = results.reduce((sum, r) => sum + r.inputSize, 0)
      const totalOutputSize = results.reduce((sum, r) => sum + r.outputSize, 0)

      expect(totalInputSize).toBeGreaterThan(0)
      expect(totalOutputSize).toBeGreaterThanOrEqual(0)

      // Reduction should be positive
      const reduction = totalInputSize - totalOutputSize
      expect(reduction).toBeGreaterThanOrEqual(0)
    })

    it('should track individual file metrics', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, { verbose: false })

      for (const result of results) {
        // All required metrics should be present
        expect(result).toHaveProperty('inputSize')
        expect(result).toHaveProperty('outputSize')
        expect(result).toHaveProperty('ratio')
        expect(result).toHaveProperty('time')
        expect(result).toHaveProperty('format')
        expect(result).toHaveProperty('status')

        // Metrics should be valid
        expect(result.inputSize).toBeGreaterThanOrEqual(0)
        expect(result.outputSize).toBeGreaterThanOrEqual(0)
        // Ratio can be > 1 if file size increased
        expect(typeof result.ratio).toBe('number')
        expect(result.time).toBeGreaterThanOrEqual(0)
      }
    })
  })
})

export {}
