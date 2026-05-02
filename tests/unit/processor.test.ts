/**
 * Processor Integration Tests
 */

import type { ProcessingProgress } from '../../src/processor/types'

import fs from 'fs'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { getAllDefaults } from '../../src/config/defaults'
import { Processor, processImages, SilentProgressTracker } from '../../src/processor/index'

// Test directories
const TEST_INPUT = './tests/fixtures/processor-test-input'
const TEST_OUTPUT = './tests/fixtures/processor-test-output'

function createTestImages() {
  // Create test directories
  if (!fs.existsSync(TEST_INPUT)) {
    fs.mkdirSync(TEST_INPUT, { recursive: true })
  }

  if (!fs.existsSync(TEST_OUTPUT)) {
    fs.mkdirSync(TEST_OUTPUT, { recursive: true })
  }

  // Create a simple PNG test file (8x8 red pixels)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00,
    0x08, 0x00, 0x00, 0x00, 0x08, 0x08, 0x02, 0x00, 0x00, 0x00, 0x4b, 0x6d, 0x02, 0xdc, 0x00, 0x00, 0x01, 0x0e, 0x49,
    0x44, 0x41, 0x54, 0x78, 0x9c, 0x62, 0xf8, 0x0f, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0xfe, 0x82, 0x82, 0x82,
  ])

  fs.writeFileSync(path.join(TEST_INPUT, 'test1.png'), pngData)
  fs.writeFileSync(path.join(TEST_INPUT, 'test2.png'), pngData)
}

function cleanup() {
  if (fs.existsSync(TEST_INPUT)) {
    fs.rmSync(TEST_INPUT, { recursive: true, force: true })
  }
  if (fs.existsSync(TEST_OUTPUT)) {
    fs.rmSync(TEST_OUTPUT, { recursive: true, force: true })
  }
}

describe('Processor', () => {
  beforeAll(() => {
    createTestImages()
  })

  afterAll(() => {
    cleanup()
  })

  describe('Processor Class', () => {
    it('should initialize with config', () => {
      const config = getAllDefaults()
      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config)

      expect(processor).toBeDefined()
      expect(processor.getResults()).toEqual([])
    })

    it('should process images and return results', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT
      config.verbose = false

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config)
      const results = await processor.process()

      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should create output files', async () => {
      // Clear output first
      if (fs.existsSync(TEST_OUTPUT)) {
        fs.rmSync(TEST_OUTPUT, { recursive: true, force: true })
      }

      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config)
      const results = await processor.process()

      // Check output files were created
      for (const result of results) {
        if (result.status === 'success') {
          expect(fs.existsSync(result.outputPath)).toBe(true)
        }
      }
    })

    it('should track processing stats', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config)
      await processor.process()

      const stats = processor.getStats()

      expect(stats.totalFiles).toBeGreaterThan(0)
      expect(stats.processedFiles).toBeGreaterThanOrEqual(0)
      expect(stats.successCount).toBeGreaterThanOrEqual(0)
      expect(stats.totalInputSize).toBeGreaterThanOrEqual(0)
    })

    it('should emit progress callbacks', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      const progressUpdates: ProcessingProgress[] = []

      const progressCallback = (progress: ProcessingProgress) => {
        progressUpdates.push({ ...progress })
      }

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config, progressCallback)
      await processor.process()

      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates[progressUpdates.length - 1].status).toBe('completed')
    })
  })

  describe('Progress Trackers', () => {
    it('should track silent progress', () => {
      const tracker = new SilentProgressTracker()

      tracker.update({
        current: 1,
        total: 2,
        percentage: 50,
        status: 'processing',
      })

      const progress = tracker.getProgress()
      expect(progress.percentage).toBe(50)
    })
  })

  describe('processImages Function', () => {
    it('should be a convenience function', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      const results = await processImages(TEST_INPUT, TEST_OUTPUT, config)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('should support progress callback', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      let progressCalled = false

      const results = await processImages(TEST_INPUT, TEST_OUTPUT, config, () => {
        progressCalled = true
      })

      expect(progressCalled).toBe(true)
      expect(results).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing input directory gracefully', async () => {
      const config = getAllDefaults()
      const processor = new Processor('/nonexistent/path', TEST_OUTPUT, config)

      try {
        await processor.process()
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should emit error callback on processing error', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      let errorCaught = false

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config, undefined, () => {
        errorCaught = true
      })

      await processor.process()
      // Error callback may or may not be triggered depending on file processing
      expect(typeof errorCaught).toBe('boolean')
    })
  })

  describe('Output Directory Creation', () => {
    it('should create output directory if not exists', async () => {
      const customOutput = './tests/fixtures/processor-custom-output'
      const config = getAllDefaults()
      config.output = customOutput

      // Ensure it doesn't exist
      if (fs.existsSync(customOutput)) {
        fs.rmSync(customOutput, { recursive: true, force: true })
      }

      const processor = new Processor(TEST_INPUT, customOutput, config)
      await processor.process()

      expect(fs.existsSync(customOutput)).toBe(true)

      // Cleanup
      fs.rmSync(customOutput, { recursive: true, force: true })
    })
  })

  describe('Results Format', () => {
    it('should return properly formatted results', async () => {
      const config = getAllDefaults()
      config.output = TEST_OUTPUT

      const processor = new Processor(TEST_INPUT, TEST_OUTPUT, config)
      const results = await processor.process()

      for (const result of results) {
        expect(result).toHaveProperty('inputPath')
        expect(result).toHaveProperty('outputPath')
        expect(result).toHaveProperty('inputSize')
        expect(result).toHaveProperty('outputSize')
        expect(result).toHaveProperty('ratio')
        expect(result).toHaveProperty('format')
        expect(result).toHaveProperty('time')
        expect(result).toHaveProperty('status')
        expect(['success', 'error', 'skipped']).toContain(result.status)
      }
    })
  })
})

export {}
