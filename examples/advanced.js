/**
 * Advanced Example - Using config file
 * Run: node examples/advanced.js
 */

import { optimizeImages } from '../src/index.js'
import logger from '../src/utils/logger.js'

async function main() {
  console.log('🚀 Running advanced example...\n')

  // Enable verbose logging
  logger.setVerbose(true)

  try {
    const results = await optimizeImages({
      inputDir: './images',
      outputDir: './dist',
      config: {
        formats: {
          jpg: {
            quality: 75,
            progressive: true,
            removeMetadata: true,
          },
          png: {
            quality: 9,
            removeMetadata: true,
          },
          gif: {
            optimizationLevel: 2,
            removeMetadata: true,
          },
          svg: {
            minify: true,
          },
        },
        convertTo: {
          webp: {
            enabled: true,
            quality: 75,
          },
          avif: {
            enabled: false, // Set to true to enable
            quality: 60,
          },
        },
        output: {
          preserveStructure: true,
          suffix: '',
        },
      },
      recursive: true,
      workers: 1,
    })

    logger.info('✅ Optimization complete!')
    logger.info(`Processed files: ${results.length}`)

    // Print detailed results
    results.forEach((result, index) => {
      console.log(`\n  ${index + 1}. ${result.inputPath}`)
      console.log(`     → ${result.outputPath}`)
      if (result.inputSize && result.outputSize) {
        const ratio = ((1 - result.outputSize / result.inputSize) * 100).toFixed(2)
        console.log(`     📊 ${result.inputSize} → ${result.outputSize} (${ratio}% saved)`)
      }
    })
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

main()
