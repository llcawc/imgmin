/**
 * CLI module - Command-line interface for image optimization
 * Integrates with Processor and provides user-friendly output
 */

import type { ProcessingProgress } from './processor/types.ts'
import type { CliOptions } from './types/index.ts'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { optimizeImages, getDefaultConfig } from './index.ts'
import { DetailedProgressTracker } from './processor/progress.ts'
import logger from './utils/logger.ts'

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * CLI entry point - Parse arguments and run optimization
 * @param args - Command line arguments
 */
export async function cli(args: string[]): Promise<void> {
  const argv = yargs(hideBin(args))
    .option('input', {
      alias: 'i',
      describe: 'Input directory',
      type: 'string',
      demandOption: false,
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory',
      type: 'string',
      demandOption: false,
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
    .option('dry-run', {
      describe: 'Perform a dry-run without writing files',
      type: 'boolean',
      default: false,
    })
    .help()
    .alias('help', 'h')
    .version()
    .alias('version', 'V')
    .parseSync() as CliOptions

  // Setup logger
  if (argv.verbose) {
    logger.setVerbose(true)
  }

  // Validate required options
  if (!argv.input || !argv.output) {
    logger.error('❌ --input and --output are required')
    logger.info('ℹ️  Use --help for more information')
    process.exit(1)
  }

  logger.info('🚀 imgmin - Image Optimization CLI')
  logger.info(`📁 Input:  ${argv.input}`)
  logger.info(`📁 Output: ${argv.output}`)

  if (argv.dryRun) {
    logger.warn('⚠️  Dry-run mode: no files will be written')
  }

  if (argv.verbose) {
    logger.debug('🔧 Options:')
    if (argv.quality) logger.debug(`  Quality: ${argv.quality}`)
    if (argv.removeMetadata) logger.debug(`  Remove Metadata: true`)
    if (argv.convertWebp) logger.debug(`  Convert to WebP: true`)
    if (argv.convertAvif) logger.debug(`  Convert to AVIF: true`)
    logger.debug(`  Workers: ${argv.workers}`)
  }

  try {
    logger.info('')
    logger.info('⏳ Processing images...')
    logger.info('')

    // Create progress tracker for detailed output
    const progressTracker = new DetailedProgressTracker()

    // Progress callback for real-time updates
    const onProgress = (progress: ProcessingProgress) => {
      if (argv.verbose || progress.current % 5 === 0) {
        progressTracker.update(progress)
      }
    }

    // Error callback
    const onError = (error: Error) => {
      logger.error(`❌ Error: ${error.message}`)
      if (argv.verbose) {
        logger.debug(`Stack: ${error.stack}`)
      }
    }

    // Run optimization
    const results = await optimizeImages(argv.input, argv.output, argv as any, onProgress, onError)

    // Generate summary
    logger.info('')
    logger.info('📊 Optimization Summary:')
    logger.info('─'.repeat(50))

    const totalFiles = results.length
    const successCount = results.filter((r) => r.status === 'success').length
    const errorCount = results.filter((r) => r.status === 'error').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length

    const totalInputSize = results.reduce((sum, r) => sum + r.inputSize, 0)
    const totalOutputSize = results.reduce((sum, r) => sum + r.outputSize, 0)
    const totalReduction = totalInputSize - totalOutputSize
    const reductionPercent = totalInputSize > 0 ? ((totalReduction / totalInputSize) * 100).toFixed(2) : '0'

    logger.info(`Total Files:     ${totalFiles}`)
    logger.info(`✅ Success:      ${successCount}`)
    logger.info(`❌ Errors:       ${errorCount}`)
    logger.info(`⏭️  Skipped:      ${skippedCount}`)
    logger.info('')
    logger.info(`📁 Input Size:   ${formatBytes(totalInputSize)}`)
    logger.info(`📁 Output Size:  ${formatBytes(totalOutputSize)}`)
    logger.info(`💾 Reduction:    ${formatBytes(totalReduction)} (${reductionPercent}%)`)
    logger.info('─'.repeat(50))

    // Verbose: Show detailed results
    if (argv.verbose && results.length > 0) {
      logger.info('')
      logger.info('📝 Detailed Results:')
      for (const result of results.slice(0, 10)) {
        const status = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️'
        logger.info(
          `${status} ${result.format.toUpperCase()}: ${result.inputPath} ` +
            `(${formatBytes(result.inputSize)} → ${formatBytes(result.outputSize)}, ${result.time.toFixed(2)}ms)`,
        )
      }
      if (results.length > 10) {
        logger.info(`... and ${results.length - 10} more files`)
      }
    }

    // Exit with error if there were failures
    const hasFailures = errorCount > 0 && errorCount === totalFiles
    if (hasFailures) {
      logger.error('❌ All files failed to process')
      logger.info('')
      logger.error('❌ Image optimization failed')
      process.exit(1)
    }

    logger.info('')
    logger.info('✅ Image optimization complete!')
  } catch (error) {
    logger.error(`❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`)
    if (argv.verbose && error instanceof Error) {
      logger.debug(`Stack: ${error.stack}`)
    }
    process.exit(1)
  }
}

export default cli
