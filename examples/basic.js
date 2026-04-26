/**
 * Basic Example - Simple API usage
 * Run: node examples/basic.js
 */

import { optimizeImages } from '../src/index.js'

async function main() {
  console.log('🚀 Running basic example...\n')

  try {
    const results = await optimizeImages({
      inputDir: './test-images',
      outputDir: './dist',
      config: {
        formats: {
          jpg: {
            quality: 80,
            progressive: true,
            removeMetadata: true,
          },
          png: {
            quality: 9,
            removeMetadata: true,
          },
        },
        convertTo: {
          webp: {
            enabled: true,
            quality: 80,
          },
        },
      },
      recursive: true,
      workers: 1,
    })

    console.log('\n✅ Optimization complete!')
    console.log(`Results:`, results)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
