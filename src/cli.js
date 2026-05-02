import yargs from 'yargs'

import logger from './utils/logger.js'

/**
 * CLI module - парсинг аргументов и вызов API
 * @param {string[]} args - аргументы командной строки
 * @returns {Promise<void>}
 */
async function cli(args) {
  const argv = await yargs(args)
    .option('input', {
      alias: 'i',
      describe: 'Input directory',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string',
    })
    .option('config', {
      alias: 'c',
      describe: 'Path to config JSON file',
      type: 'string',
    })
    .option('quality', {
      alias: 'q',
      describe: 'Image quality (0-100)',
      type: 'number',
    })
    .option('remove-metadata', {
      describe: 'Remove metadata from images',
      type: 'boolean',
      default: false,
    })
    .option('convert-webp', {
      describe: 'Convert to WebP format',
      type: 'boolean',
      default: false,
    })
    .option('convert-avif', {
      describe: 'Convert to AVIF format',
      type: 'boolean',
      default: false,
    })
    .option('workers', {
      describe: 'Number of parallel workers',
      type: 'number',
      default: 1,
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Verbose logging',
      type: 'boolean',
      default: false,
    })
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'V').argv

  if (argv.verbose) {
    logger.setVerbose(true)
  }

  if (!argv.input || !argv.output) {
    logger.error('--input and --output are required')
    logger.info('Use --help for more information')
    process.exit(1)
  }

  logger.info(`🚀 Starting image optimization...`)
  logger.info(`📁 Input: ${argv.input}`)
  logger.info(`📁 Output: ${argv.output}`)

  if (argv.verbose) {
    logger.debug('Verbose mode enabled')
    logger.debug(`Quality: ${argv.quality}`)
    logger.debug(`Remove metadata: ${argv['remove-metadata']}`)
    logger.debug(`Convert WebP: ${argv['convert-webp']}`)
    logger.debug(`Convert AVIF: ${argv['convert-avif']}`)
    logger.debug(`Workers: ${argv.workers}`)
  }

  logger.info('✅ CLI is working! (Phase 1 complete)')
}

export default cli
