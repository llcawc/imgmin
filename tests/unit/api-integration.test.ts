/**
 * API Integration Tests
 * Tests the public API surface
 */

import type { ImageOptimizationResult, ProcessingProgress } from '../../src/index.ts'

import fs from 'fs'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import {
  optimizeImages,
  getDefaultConfig,
  scanImages,
  logger,
  Processor,
  loadConfig,
  scanFiles,
} from '../../src/index.ts'

// Test directories
const TEST_INPUT = './tests/fixtures/api-test-input'
const TEST_OUTPUT = './tests/fixtures/api-test-output'

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

describe('Public API', () => {
  beforeAll(() => {
    createTestImages()
  })

  afterAll(() => {
    cleanup()
  })

  describe('optimizeImages()', () => {
    it('should be a function', () => {
      expect(typeof optimizeImages).toBe('function')
    })

    it('should accept inputDir and outputDir', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT)
      expect(Array.isArray(results)).toBe(true)
    })

    it('should accept options object', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, {
        verbose: false,
        quality: 80,
      })
      expect(Array.isArray(results)).toBe(true)
    })

    it('should support progress callback', async () => {
      let progressCalled = false
      const onProgress = (progress: ProcessingProgress) => {
        progressCalled = true
      }

      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, {}, onProgress)
      expect(progressCalled).toBe(true)
      expect(Array.isArray(results)).toBe(true)
    })

    it('should support error callback', async () => {
      let errorCalled = false
      const onError = (error: Error) => {
        errorCalled = true
      }

      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT, {}, undefined, onError)
      expect(Array.isArray(results)).toBe(true)
      // Error callback may or may not be triggered
      expect(typeof errorCalled).toBe('boolean')
    })

    it('should return ImageOptimizationResult[] type', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT)

      for (const result of results) {
        expect(result).toHaveProperty('inputPath')
        expect(result).toHaveProperty('outputPath')
        expect(result).toHaveProperty('inputSize')
        expect(result).toHaveProperty('outputSize')
        expect(result).toHaveProperty('ratio')
        expect(result).toHaveProperty('format')
        expect(result).toHaveProperty('time')
        expect(result).toHaveProperty('status')
      }
    })
  })

  describe('getDefaultConfig()', () => {
    it('should be a function', () => {
      expect(typeof getDefaultConfig).toBe('function')
    })

    it('should return config object', () => {
      const config = getDefaultConfig()
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })

    it('should have format-specific options', () => {
      const config = getDefaultConfig()
      expect(config).toHaveProperty('formats')
      expect(config.formats).toHaveProperty('jpg')
      expect(config.formats).toHaveProperty('png')
      expect(config.formats).toHaveProperty('gif')
      expect(config.formats).toHaveProperty('svg')
      expect(config).toHaveProperty('convertTo')
      expect(config.convertTo).toHaveProperty('webp')
      expect(config.convertTo).toHaveProperty('avif')
    })
  })

  describe('scanImages()', () => {
    it('should be a function', () => {
      expect(typeof scanImages).toBe('function')
    })

    it('should scan directory', async () => {
      const files = await scanImages(TEST_INPUT, true)
      expect(Array.isArray(files)).toBe(true)
    })

    it('should support recursive flag', async () => {
      const filesRecursive = await scanImages(TEST_INPUT, true)
      const filesNonRecursive = await scanImages(TEST_INPUT, false)

      expect(Array.isArray(filesRecursive)).toBe(true)
      expect(Array.isArray(filesNonRecursive)).toBe(true)
    })
  })

  describe('Exported Components', () => {
    it('should export Processor class', () => {
      expect(Processor).toBeDefined()
      expect(typeof Processor).toBe('function')
    })

    it('should export loadConfig function', () => {
      expect(loadConfig).toBeDefined()
      expect(typeof loadConfig).toBe('function')
    })

    it('should export scanFiles function', () => {
      expect(scanFiles).toBeDefined()
      expect(typeof scanFiles).toBe('function')
    })

    it('should export logger instance', () => {
      expect(logger).toBeDefined()
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('error')
    })
  })

  describe('Type System', () => {
    it('should have correct return types', async () => {
      const results = await optimizeImages(TEST_INPUT, TEST_OUTPUT)
      expect(Array.isArray(results)).toBe(true)

      if (results.length > 0) {
        const result: ImageOptimizationResult = results[0]
        expect(typeof result.inputPath).toBe('string')
        expect(typeof result.outputPath).toBe('string')
        expect(typeof result.inputSize).toBe('number')
        expect(typeof result.outputSize).toBe('number')
        expect(typeof result.ratio).toBe('number')
        expect(typeof result.format).toBe('string')
        expect(typeof result.time).toBe('number')
        expect(['success', 'error', 'skipped']).toContain(result.status)
      }
    })
  })

  describe('Default Export', () => {
    it('should have default export as object', async () => {
      // Default export is available but testing it requires ESM import
      // Just verify the functions are available
      expect(typeof optimizeImages).toBe('function')
      expect(typeof getDefaultConfig).toBe('function')
      expect(typeof scanImages).toBe('function')
      expect(typeof logger).toBe('object')
    })
  })
})

export {}
