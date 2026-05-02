#!/usr/bin/env node

/**
 * imgmin CLI Entry Point (TypeScript)
 */

import cli from '../src/cli.ts'

cli(process.argv.slice(2)).catch((error: Error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
