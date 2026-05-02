/**
 * Basic Example - Simple API usage
 * Run: node examples/basic.js
 */

import { optimizeImages } from '../src/index.js'

async function main() {
  console.log('🚀 Running basic example...\n')

  try {
    // Simple configuration with defaults
    const results = await optimizeImages({
      inputDir: './test-images',
      outputDir: './dist',
      config: {
        jpg: { quality: 80 },
        png: { compressionLevel: 9 },
        convertToWebp: true,
        verbose: true,
      },
      recursive: true,
    })

    console.log('\n✅ Optimization complete!')
    console.log(`Processed ${results?.length || 0} images`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
