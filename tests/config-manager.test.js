import fs from 'fs'
import os from 'os'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import {
  loadJsonConfig,
  mergeConfigs,
  cliArgsToConfig,
  loadConfig,
  validateConfig,
} from '../src/config/config-manager.js'

const testDir = path.join(os.tmpdir(), 'imgmin-test-config')

beforeAll(() => {
  // Create test directory
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // Create test config file
  const testConfig = {
    jpg: { quality: 75 },
    png: { compressionLevel: 8 },
    convertToWebp: true,
  }
  fs.writeFileSync(path.join(testDir, 'config.json'), JSON.stringify(testConfig))
})

afterAll(() => {
  // Clean up test files
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true })
  }
})

describe('Config Manager', () => {
  describe('loadJsonConfig', () => {
    it('should load valid JSON config file', () => {
      const configPath = path.join(testDir, 'config.json')
      const config = loadJsonConfig(configPath)

      expect(config.jpg.quality).toBe(75)
      expect(config.png.compressionLevel).toBe(8)
      expect(config.convertToWebp).toBe(true)
    })

    it('should return empty object for non-existent file', () => {
      const config = loadJsonConfig('/non/existent/path.json')
      expect(config).toEqual({})
    })

    it('should return empty object when path is null/undefined', () => {
      expect(loadJsonConfig(null)).toEqual({})
      expect(loadJsonConfig(undefined)).toEqual({})
    })
  })

  describe('mergeConfigs', () => {
    it('should merge multiple config objects', () => {
      const config1 = { jpg: { quality: 80 }, workers: 1 }
      const config2 = { jpg: { progressive: true }, convertToWebp: true }
      const result = mergeConfigs(config1, config2)

      expect(result.jpg).toEqual({ quality: 80, progressive: true })
      expect(result.workers).toBe(1)
      expect(result.convertToWebp).toBe(true)
    })

    it('should override earlier values with later ones', () => {
      const config1 = { quality: 70 }
      const config2 = { quality: 90 }
      const result = mergeConfigs(config1, config2)

      expect(result.quality).toBe(90)
    })

    it('should handle empty configs', () => {
      const result = mergeConfigs({}, { jpg: { quality: 80 } }, {})
      expect(result.jpg.quality).toBe(80)
    })
  })

  describe('cliArgsToConfig', () => {
    it('should convert quality CLI arg', () => {
      const argv = { quality: 85 }
      const config = cliArgsToConfig(argv)

      expect(config.jpg.quality).toBe(85)
      expect(config.webp.quality).toBe(85)
    })

    it('should clamp quality to 0-100', () => {
      const config1 = cliArgsToConfig({ quality: 150 })
      const config2 = cliArgsToConfig({ quality: -10 })

      expect(config1.jpg.quality).toBe(100)
      expect(config2.jpg.quality).toBe(0)
    })

    it('should convert boolean flags', () => {
      const argv = {
        'remove-metadata': true,
        'convert-webp': true,
        'convert-avif': false,
        workers: 4,
        verbose: true,
      }
      const config = cliArgsToConfig(argv)

      expect(config.removeMetadata).toBe(true)
      expect(config.convertToWebp).toBe(true)
      expect(config.convertToAvif).toBe(false)
      expect(config.workers).toBe(4)
      expect(config.verbose).toBe(true)
    })

    it('should enforce minimum workers value', () => {
      const argv = { workers: 0 }
      const config = cliArgsToConfig(argv)

      expect(config.workers).toBe(1)
    })
  })

  describe('validateConfig', () => {
    it('should validate correct config', () => {
      const config = {
        jpg: { quality: 80 },
        webp: { quality: 80 },
        workers: 2,
        verbose: true,
      }
      const result = validateConfig(config)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid quality values', () => {
      const config = { jpg: { quality: 150 } }
      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('must be between 0 and 100')
    })

    it('should reject invalid workers value', () => {
      const config = { workers: 0 }
      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('workers must be >= 1')
    })

    it('should validate boolean fields', () => {
      const config = { verbose: 'not-a-boolean' }
      const result = validateConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('must be boolean')
    })
  })

  describe('loadConfig', () => {
    it('should merge configs in correct priority', () => {
      const options = {
        jsonConfigPath: path.join(testDir, 'config.json'),
        cliArgs: { quality: 90, 'convert-webp': false },
      }
      const config = loadConfig(options)

      // PNG compression from JSON should be preserved
      expect(config.png.compressionLevel).toBe(8)

      // Quality from CLI should override JSON
      expect(config.jpg.quality).toBe(90)

      // convertToWebp from CLI should override JSON
      expect(config.convertToWebp).toBe(false)
    })

    it('should handle empty options', () => {
      const config = loadConfig({})

      // Should have defaults
      expect(config.jpg.quality).toBe(80)
      expect(config.avif.quality).toBe(60)
    })
  })
})
