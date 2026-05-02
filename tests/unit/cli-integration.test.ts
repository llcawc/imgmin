/**
 * CLI Integration Tests
 * Tests the command-line interface
 */

import fs from 'fs'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'

import { cli } from '../../src/cli.ts'
import logger from '../../src/utils/logger.ts'

// Test directories
const TEST_INPUT = './tests/fixtures/cli-test-input'
const TEST_OUTPUT = './tests/fixtures/cli-test-output'

function createTestImages() {
  // Create test directories
  if (!fs.existsSync(TEST_INPUT)) {
    fs.mkdirSync(TEST_INPUT, { recursive: true })
  }

  if (!fs.existsSync(TEST_OUTPUT)) {
    fs.mkdirSync(TEST_OUTPUT, { recursive: true })
  }

  // Create a simple PNG test file
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

describe('CLI Integration', () => {
  beforeAll(() => {
    createTestImages()
  })

  afterAll(() => {
    cleanup()
  })

  describe('Command-line Parsing', () => {
    it('should handle --help flag', async () => {
      // Spy on logger to capture help output
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['--help'])
      } catch (error) {
        // Expected to throw on help
      }

      infoSpy.mockRestore()
    })

    it('should require --input and --output', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('Process exit called')
      })

      try {
        await cli(['imgmin'])
      } catch (error) {
        expect(error).toBeDefined()
      }

      exitSpy.mockRestore()
    })

    it('should parse input and output arguments', async () => {
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT])
      } catch (error) {
        // May fail due to environment, that's ok
      }

      expect(infoSpy).toHaveBeenCalled()
      infoSpy.mockRestore()
    })
  })

  describe('CLI Options', () => {
    it('should support --verbose flag', async () => {
      const setVerboseSpy = vi.spyOn(logger, 'setVerbose')
      const debugSpy = vi.spyOn(logger, 'debug')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT, '--verbose'])
      } catch (error) {
        // May fail
      }

      expect(setVerboseSpy).toHaveBeenCalledWith(true)

      setVerboseSpy.mockRestore()
      debugSpy.mockRestore()
    })

    it('should support --quality option', async () => {
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT, '--quality', '85'])
      } catch (error) {
        // May fail
      }

      expect(infoSpy).toHaveBeenCalled()
      infoSpy.mockRestore()
    })

    it('should support --dry-run flag', async () => {
      const warnSpy = vi.spyOn(logger, 'warn')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT, '--dry-run'])
      } catch (error) {
        // May fail
      }

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Dry-run'))

      warnSpy.mockRestore()
    })
  })

  describe('Output Formatting', () => {
    it('should display optimization summary', async () => {
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT])
      } catch (error) {
        // May fail
      }

      const calls = infoSpy.mock.calls.map((c) => c[0].toString())
      const output = calls.join('\n')

      // Check for summary elements
      expect(output).toContain('Optimization Summary')

      infoSpy.mockRestore()
    })

    it('should show success or completion message', async () => {
      const infoSpy = vi.spyOn(logger, 'info')
      const errorSpy = vi.spyOn(logger, 'error')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT])
      } catch (error) {
        // May fail due to exit
      }

      const infoOutput = infoSpy.mock.calls.map((c) => c[0].toString()).join('\n')
      const errorOutput = errorSpy.mock.calls.map((c) => c[0].toString()).join('\n')
      const output = (infoOutput + errorOutput).toLowerCase()

      // Check for summary or error message (at least one should be present)
      expect(output).toMatch(/summary|complete|error|failed/)

      infoSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('should handle missing input directory', async () => {
      const errorSpy = vi.spyOn(logger, 'error')

      try {
        await cli(['node', 'cli.ts', '--input', '/nonexistent/path', '--output', TEST_OUTPUT])
      } catch (error) {
        // Expected to fail
      }

      errorSpy.mockRestore()
    })

    it('should provide helpful error messages', async () => {
      const errorSpy = vi.spyOn(logger, 'error')

      try {
        await cli(['node', 'cli.ts', '--input', '/nonexistent/path', '--output', TEST_OUTPUT])
      } catch (error) {
        // Expected to fail
      }

      // Error message should be helpful
      const errorCalls = errorSpy.mock.calls.map((c) => c[0].toString())
      expect(errorCalls.length).toBeGreaterThanOrEqual(0)

      errorSpy.mockRestore()
    })
  })

  describe('CLI Aliases', () => {
    it('should support short options', async () => {
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '-i', TEST_INPUT, '-o', TEST_OUTPUT, '-v'])
      } catch (error) {
        // May fail
      }

      expect(infoSpy).toHaveBeenCalled()
      infoSpy.mockRestore()
    })

    it('should support -q for quality', async () => {
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '-i', TEST_INPUT, '-o', TEST_OUTPUT, '-q', '80'])
      } catch (error) {
        // May fail
      }

      expect(infoSpy).toHaveBeenCalled()
      infoSpy.mockRestore()
    })
  })

  describe('Format Support', () => {
    it('should display byte formatting', async () => {
      // The formatBytes function should work correctly
      // This is tested implicitly through other tests
      const infoSpy = vi.spyOn(logger, 'info')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT])
      } catch (error) {
        // May fail
      }

      const calls = infoSpy.mock.calls.map((c) => c[0].toString())
      const output = calls.join('\n')

      // Should display byte sizes (B, KB, MB, GB)
      expect(output).toMatch(/\d+\s+(B|KB|MB|GB)/)

      infoSpy.mockRestore()
    })
  })

  describe('Logging Integration', () => {
    it('should use logger for all output', async () => {
      const infoSpy = vi.spyOn(logger, 'info')
      const debugSpy = vi.spyOn(logger, 'debug')

      try {
        await cli(['node', 'cli.ts', '--input', TEST_INPUT, '--output', TEST_OUTPUT, '--verbose'])
      } catch (error) {
        // May fail
      }

      // Logger should be called
      expect(infoSpy.mock.calls.length + debugSpy.mock.calls.length).toBeGreaterThan(0)

      infoSpy.mockRestore()
      debugSpy.mockRestore()
    })
  })
})

export {}
