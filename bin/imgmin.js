#!/usr/bin/env node

import cli from '../src/cli.js'

cli(process.argv.slice(2)).catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
