/**
 * Configuration manager - loads, merges, and validates configurations
 * Priority: CLI args > JSON config > defaults
 */

import fs from 'fs'
import path from 'path'

import logger from '../utils/logger.js'
import { getAllDefaults, getFormatDefaults } from './defaults.js'

/**
 * Load configuration from JSON file
 * @param {string} configPath - Path to JSON config file
 * @returns {Object} - Parsed configuration object
 */
export function loadJsonConfig(configPath) {
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
    logger.error(`Failed to load config: ${error.message}`)
    return {}
  }
}

/**
 * Merge multiple config objects
 * Later objects override earlier ones
 * @param {...Object} configs - Config objects to merge
 * @returns {Object} - Merged configuration
 */
export function mergeConfigs(...configs) {
  const result = {}

  for (const config of configs) {
    if (config && typeof config === 'object') {
      for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          result[key] = { ...result[key], ...value }
        } else {
          result[key] = value
        }
      }
    }
  }

  return result
}

/**
 * Convert CLI arguments to config object
 * @param {Object} argv - Parsed yargs arguments
 * @returns {Object} - Configuration object from CLI
 */
export function cliArgsToConfig(argv) {
  const config = {}

  if (argv.quality !== undefined) {
    config.jpg = { quality: Math.max(0, Math.min(100, argv.quality)) }
    config.webp = { quality: argv.quality }
    config.avif = { quality: Math.max(0, Math.min(100, argv.quality)) }
  }

  if (argv['remove-metadata'] !== undefined) {
    config.removeMetadata = argv['remove-metadata']
  }

  if (argv['convert-webp'] !== undefined) {
    config.convertToWebp = argv['convert-webp']
  }

  if (argv['convert-avif'] !== undefined) {
    config.convertToAvif = argv['convert-avif']
  }

  if (argv.workers !== undefined) {
    config.workers = Math.max(1, argv.workers)
  }

  if (argv.verbose !== undefined) {
    config.verbose = argv.verbose
  }

  return config
}

/**
 * Load and merge configuration from all sources
 * @param {Object} options - Options object
 * @param {string} options.jsonConfigPath - Path to JSON config file
 * @param {Object} options.cliArgs - Parsed CLI arguments
 * @returns {Object} - Final merged configuration
 */
export function loadConfig(options = {}) {
  const defaults = getAllDefaults()
  const jsonConfig = loadJsonConfig(options.jsonConfigPath)
  const cliConfig = cliArgsToConfig(options.cliArgs || {})

  // Priority: defaults < JSON config < CLI args
  const finalConfig = mergeConfigs(defaults, jsonConfig, cliConfig)

  if (options.cliArgs?.verbose) {
    logger.debug('Final merged config:', JSON.stringify(finalConfig, null, 2))
  }

  return finalConfig
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} - Validation result {valid: boolean, errors: string[]}
 */
export function validateConfig(config) {
  const errors = []

  // Validate quality values (0-100)
  const qualityFields = ['jpg', 'png', 'webp', 'avif']
  for (const format of qualityFields) {
    if (config[format]?.quality !== undefined) {
      const quality = config[format].quality
      if (quality < 0 || quality > 100) {
        errors.push(`${format}.quality must be between 0 and 100, got ${quality}`)
      }
    }
  }

  // Validate workers (minimum 1)
  if (config.workers !== undefined && config.workers < 1) {
    errors.push(`workers must be >= 1, got ${config.workers}`)
  }

  // Validate boolean fields
  const booleanFields = ['convertToWebp', 'convertToAvif', 'removeMetadata', 'verbose']
  for (const field of booleanFields) {
    if (config[field] !== undefined && typeof config[field] !== 'boolean') {
      errors.push(`${field} must be boolean, got ${typeof config[field]}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default {
  loadJsonConfig,
  mergeConfigs,
  cliArgsToConfig,
  loadConfig,
  validateConfig,
}
