/**
 * Config Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'

import { loadConfig, loadJsonConfig, cliOptionsToConfig, getFormatConfig } from '../../src/config/config-manager.ts'
import { DEFAULT_CONFIG } from '../../src/config/defaults.ts'

describe('Config Manager', () => {
  describe('cliOptionsToConfig', () => {
    it('should convert quality option', () => {
      const result = cliOptionsToConfig({ quality: 75 })
      expect(result.formats?.jpg.quality).toBe(75)
    })

    it('should convert removeMetadata option', () => {
      const result = cliOptionsToConfig({ removeMetadata: false })
      expect(result.formats?.jpg.removeMetadata).toBe(false)
      expect(result.formats?.png.removeMetadata).toBe(false)
    })

    it('should convert convertWebp option', () => {
      const result = cliOptionsToConfig({ convertWebp: true })
      expect(result.convertTo?.webp.enabled).toBe(true)
    })

    it('should convert convertAvif option', () => {
      const result = cliOptionsToConfig({ convertAvif: true })
      expect(result.convertTo?.avif.enabled).toBe(true)
    })

    it('should convert workers option', () => {
      const result = cliOptionsToConfig({ workers: 4 })
      expect(result.workers).toBe(4)
    })

    it('should handle multiple options', () => {
      const result = cliOptionsToConfig({
        quality: 90,
        removeMetadata: true,
        convertWebp: true,
        workers: 2,
      })
      expect(result.formats?.jpg.quality).toBe(90)
      expect(result.convertTo?.webp.enabled).toBe(true)
      expect(result.workers).toBe(2)
    })
  })

  describe('loadConfig', () => {
    it('should return default config when no options provided', () => {
      const result = loadConfig({})
      expect(result).toEqual(DEFAULT_CONFIG)
    })

    it('should merge CLI options with defaults', () => {
      const result = loadConfig({
        cliOptions: { quality: 85 },
      })
      expect(result.formats.jpg.quality).toBe(85)
      expect(result.formats.png.compressionLevel).toBe(DEFAULT_CONFIG.formats.png.compressionLevel)
    })

    it('should validate configuration', () => {
      const config = loadConfig({
        cliOptions: { quality: 50, workers: 2 },
      })
      expect(config.formats.jpg.quality).toBe(50)
      expect(config.workers).toBe(2)
      expect(config.verbose).toBe(false)
    })

    it('should set verbose flag', () => {
      const config = loadConfig({
        verbose: true,
      })
      expect(config.verbose).toBe(true)
    })
  })

  describe('getFormatConfig', () => {
    it('should return format-specific config', () => {
      const jpgConfig = getFormatConfig(DEFAULT_CONFIG, 'jpg')
      expect(jpgConfig).toEqual(DEFAULT_CONFIG.formats.jpg)
    })

    it('should handle lowercase format names', () => {
      const jpgConfig = getFormatConfig(DEFAULT_CONFIG, 'jpg')
      expect(jpgConfig.quality).toBe(DEFAULT_CONFIG.formats.jpg.quality)
    })

    it('should return PNG config', () => {
      const pngConfig = getFormatConfig(DEFAULT_CONFIG, 'png')
      expect(pngConfig.compressionLevel).toBe(9)
    })
  })

  describe('loadJsonConfig', () => {
    it('should return empty object for undefined path', () => {
      const result = loadJsonConfig(undefined)
      expect(result).toEqual({})
    })

    it('should handle missing file gracefully', () => {
      const result = loadJsonConfig('/nonexistent/config.json')
      expect(result).toEqual({})
    })
  })
})
