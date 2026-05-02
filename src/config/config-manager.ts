/**
 * Configuration Manager - loads, merges, and validates configurations
 * Priority: CLI args > JSON config > defaults
 */

import type { ImgminConfig } from '../types/config'
import type { CliOptions } from '../types/index'

import fs from 'fs'
import path from 'path'

import logger from '../utils/logger.ts'
import { DEFAULT_CONFIG, getAllDefaults, getFormatDefaults } from './defaults.ts'
import { validateConfig, safeValidateConfig } from './schema.ts'

/**
 * Load configuration from JSON file
 */
export function loadJsonConfig(configPath?: string): Partial<ImgminConfig> {
  if (!configPath) {
    return {}
  }

  try {
    if (!fs.existsSync(configPath)) {
      logger.warn(`Config file not found: ${configPath}`)
      return {}
    }

    const content = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(content)
    logger.info(`✅ Loaded config from: ${configPath}`)
    return config
  } catch (error) {
    logger.error(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`)
    return {}
  }
}

/**
 * Convert CLI options to config object
 */
export function cliOptionsToConfig(options: Partial<CliOptions>): Partial<ImgminConfig> {
  const config: Partial<ImgminConfig> = {}

  if (options.quality !== undefined) {
    config.formats = {
      ...DEFAULT_CONFIG.formats,
      jpg: { ...DEFAULT_CONFIG.formats.jpg, quality: options.quality },
      png: { ...DEFAULT_CONFIG.formats.png },
      gif: { ...DEFAULT_CONFIG.formats.gif },
      svg: { ...DEFAULT_CONFIG.formats.svg },
    }
  }

  if (options.removeMetadata !== undefined) {
    if (!config.formats) {
      config.formats = { ...DEFAULT_CONFIG.formats }
    }
    config.formats.jpg.removeMetadata = options.removeMetadata
    config.formats.png.removeMetadata = options.removeMetadata
    config.formats.gif.removeMetadata = options.removeMetadata
  }

  if (options.convertWebp !== undefined || options.convertAvif !== undefined) {
    config.convertTo = { ...DEFAULT_CONFIG.convertTo }
    if (options.convertWebp !== undefined) {
      config.convertTo.webp.enabled = options.convertWebp
    }
    if (options.convertAvif !== undefined) {
      config.convertTo.avif.enabled = options.convertAvif
    }
  }

  if (options.workers !== undefined) {
    config.workers = options.workers
  }

  if (options.verbose !== undefined) {
    config.verbose = options.verbose
  }

  return config
}

/**
 * Deep merge two configuration objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object'
      ) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else if (sourceValue !== undefined) {
        ;(result[key] as any) = sourceValue
      }
    }
  }

  return result
}

/**
 * Load and merge configurations from multiple sources
 * Priority: CLI > JSON > defaults
 */
export function loadConfig(options: {
  cliOptions?: Partial<CliOptions>
  configPath?: string
  verbose?: boolean
}): ImgminConfig {
  try {
    // Start with defaults
    let config = getAllDefaults()

    // Merge JSON config if provided
    if (options.configPath) {
      const jsonConfig = loadJsonConfig(options.configPath)
      config = deepMerge(config, jsonConfig)
    }

    // Merge CLI options if provided
    if (options.cliOptions) {
      const cliConfig = cliOptionsToConfig(options.cliOptions)
      config = deepMerge(config, cliConfig)
    }

    // Override verbose if specified in options
    if (options.verbose !== undefined) {
      config.verbose = options.verbose
    }

    // Validate final configuration
    const validated = validateConfig(config)

    if (options.verbose) {
      logger.debug(`Final config: ${JSON.stringify(validated, null, 2)}`)
    }

    return validated
  } catch (error) {
    logger.error(`Config validation failed: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}

/**
 * Get format-specific configuration
 */
export function getFormatConfig(config: ImgminConfig, format: string) {
  const formatKey = format.toLowerCase() as keyof typeof config.formats
  return config.formats[formatKey] || getFormatDefaults(formatKey)
}

export default {
  loadConfig,
  loadJsonConfig,
  cliOptionsToConfig,
  getFormatConfig,
}
