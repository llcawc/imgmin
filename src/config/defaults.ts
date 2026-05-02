/**
 * Default configuration values for each image format
 * Priority: CLI > JSON config > defaults
 */

import type { ImgminConfig, ImageFormatConfig, ConvertToConfig, OutputOptions } from '../types/config.ts'

export const DEFAULT_FORMATS: ImageFormatConfig = {
  jpg: {
    quality: 80,
    progressive: true,
    removeMetadata: true,
    chromaSubsampling: '4:2:0',
  },
  png: {
    compressionLevel: 9,
    progressive: false,
    removeMetadata: true,
  },
  gif: {
    optimizationLevel: 3,
    removeMetadata: true,
  },
  svg: {
    minify: true,
  },
}

export const DEFAULT_CONVERT_TO: ConvertToConfig = {
  webp: {
    enabled: false,
    quality: 80,
  },
  avif: {
    enabled: false,
    quality: 60,
  },
}

export const DEFAULT_OUTPUT: OutputOptions = {
  preserveStructure: true,
  suffix: '',
}

export const DEFAULT_CONFIG: ImgminConfig = {
  formats: DEFAULT_FORMATS,
  convertTo: DEFAULT_CONVERT_TO,
  output: DEFAULT_OUTPUT,
  workers: 1,
  verbose: false,
}

/**
 * Get default config for a specific format
 */
export function getFormatDefaults(format: keyof ImageFormatConfig) {
  return DEFAULT_FORMATS[format]
}

/**
 * Get all default configurations
 */
export function getAllDefaults(): ImgminConfig {
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG))
}
