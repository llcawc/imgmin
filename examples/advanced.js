/**
 * Advanced Example - Using config file and multiple options
 * Run: node examples/advanced.js
 */

import { loadConfig } from '../src/config/config-manager.js'
import { optimizeImages } from '../src/index.js'
import logger from '../src/utils/logger.js'

async function main() {
  console.log('🚀 Running advanced example...\n')

  // Enable verbose logging
  logger.setVerbose(true)

  try {
    // Load configuration from JSON file and merge with CLI options
    const config = loadConfig({
      jsonConfigPath: './examples/config-example.json',
      cliArgs: {
        quality: 85,
        'convert-webp': true,
        'convert-avif': false,
        workers: 2,
      },
    })

    const results = await optimizeImages({
      inputDir: './images',
      outputDir: './dist',
      config,
      recursive: true,
    })

    logger.info('✅ Optimization complete!')
    logger.info(`Processed files: ${results?.length || 0}`)

    // Print detailed results
    if (results && Array.isArray(results)) {
      results.forEach((result, index) => {
        console.log(`\n  ${index + 1}. ${result.inputPath}`)
        console.log(`     → ${result.outputPath}`)
        if (result.inputSize && result.outputSize) {
          const ratio = ((1 - result.outputSize / result.inputSize) * 100).toFixed(2)
          console.log(`     📊 ${result.inputSize} → ${result.outputSize} (${ratio}% saved)`)
        }
      })
    }
  } catch (error) {
    logger.error(error.message)
    process.exit(1)
  }
}

main()
