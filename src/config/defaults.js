/**
 * Default configuration values for each image format
 * Used as fallback when no config is provided
 */

export const defaults = {
  // JPG optimization settings
  jpg: {
    quality: 80,
    progressive: true,
    removeMetadata: true,
    chromaSubsampling: '4:2:0',
  },

  // PNG optimization settings
  png: {
    compressionLevel: 9,
    progressive: false,
    removeMetadata: true,
  },

  // GIF settings (limited Sharp support)
  gif: {
    loop: 0,
    delay: 100,
    removeMetadata: true,
  },

  // SVG optimization with SVGO
  svg: {
    removeViewBox: false,
    removeMetadata: true,
    removeComments: true,
    removeDesc: true,
  },

  // WebP conversion settings
  webp: {
    quality: 80,
    alphaQuality: 100,
    lossless: false,
  },

  // AVIF conversion settings (more aggressive compression)
  avif: {
    quality: 60,
    lossless: false,
    effort: 9,
  },

  // Global settings
  global: {
    convertToWebp: false,
    convertToAvif: false,
    removeMetadata: true,
    outputFormat: null, // if null, preserves original format
    workers: 1,
    verbose: false,
  },
}

/**
 * Get default config for a specific format
 * @param {string} format - Image format (jpg, png, gif, svg, webp, avif)
 * @returns {Object} - Default configuration for that format
 */
export function getFormatDefaults(format) {
  const normalized = format?.toLowerCase().replace(/^\./, '')
  return defaults[normalized] || {}
}

/**
 * Get all defaults
 * @returns {Object} - All default configurations
 */
export function getAllDefaults() {
  return defaults
}
