/**
 * Main Processor - orchestrates image optimization workflow
 */

import type { ImgminConfig } from '../types/config'
import type { ImageOptimizationResult, CliOptions } from '../types/index'
import type { ProcessorOptions, ProcessingStats, ProcessingProgress, ProgressCallback, ErrorCallback } from './types'

import fs from 'fs'
import path from 'path'

import { loadConfig } from '../config/config-manager'
import { scanFiles } from '../file-scanner/file-scanner'
import { createOptimizer } from '../optimizers/index'
import logger from '../utils/logger'

export class Processor {
  private inputDir: string
  private outputDir: string
  private config: ImgminConfig
  private progressCallback?: ProgressCallback
  private errorCallback?: ErrorCallback
  private results: ImageOptimizationResult[] = []

  constructor(
    inputDir: string,
    outputDir: string,
    config: ImgminConfig,
    progressCallback?: ProgressCallback,
    errorCallback?: ErrorCallback,
  ) {
    this.inputDir = inputDir
    this.outputDir = outputDir
    this.config = config
    this.progressCallback = progressCallback
    this.errorCallback = errorCallback
  }

  /**
   * Main processing function
   */
  async process(): Promise<ImageOptimizationResult[]> {
    const startTime = Date.now()
    this.results = []

    try {
      // Create output directory if it doesn't exist
      this.ensureOutputDir()

      // Scan for image files
      logger.info(`🔍 Scanning ${this.inputDir}...`)
      const files = scanFiles(this.inputDir, {
        recursive: true,
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'],
      })

      if (files.length === 0) {
        logger.warn('⚠️ No image files found')
        return []
      }

      logger.info(`📊 Found ${files.length} image files`)

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Update progress
        this.emitProgress({
          current: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 100),
          currentFile: file.filename,
          status: 'processing',
        })

        try {
          const result = await this.processFile(file, startTime)
          this.results.push(result)

          if (result.status === 'success') {
            logger.info(
              `✅ ${result.inputPath}: ${result.ratio}% saved (${this.formatBytes(result.inputSize)} → ${this.formatBytes(result.outputSize)})`,
            )
          } else if (result.status === 'error') {
            logger.error(`❌ ${result.inputPath}: ${result.error}`)
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          logger.error(`❌ Error processing ${file.filename}: ${errorMsg}`)

          this.errorCallback?.(error instanceof Error ? error : new Error(errorMsg), file.path)

          this.results.push({
            inputPath: file.path,
            outputPath: path.join(this.outputDir, file.filename),
            inputSize: file.size,
            outputSize: 0,
            ratio: 0,
            format: file.extension.substring(1),
            time: Date.now() - startTime,
            status: 'error',
            error: errorMsg,
          })
        }
      }

      // Emit final progress
      this.emitProgress({
        current: files.length,
        total: files.length,
        percentage: 100,
        status: 'completed',
      })

      // Log summary
      this.logSummary()

      return this.results
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error(`Fatal error: ${errorMsg}`)
      throw error
    }
  }

  /**
   * Process individual file
   */
  private async processFile(
    file: { path: string; filename: string; extension: string; size: number },
    batchStartTime: number,
  ): Promise<ImageOptimizationResult> {
    const startTime = Date.now()

    try {
      // Read file
      const inputBuffer = fs.readFileSync(file.path)
      const format = file.extension.substring(1).toLowerCase()

      // Create optimizer
      const optimizer = createOptimizer(format)
      const formatConfig = this.config.formats[format as keyof typeof this.config.formats]

      // Optimize
      const optimizeResult = await optimizer.optimize(inputBuffer, {
        quality: formatConfig?.quality,
        removeMetadata: this.config.removeMetadata,
      })

      // Create output path
      const outputPath = path.join(this.outputDir, file.filename)
      const outputDir = path.dirname(outputPath)

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Write optimized file
      fs.writeFileSync(outputPath, optimizeResult.buffer)

      return {
        inputPath: file.path,
        outputPath,
        inputSize: file.size,
        outputSize: optimizeResult.size,
        ratio: optimizeResult.ratio,
        format,
        time: Date.now() - startTime,
        status: 'success',
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)

      return {
        inputPath: file.path,
        outputPath: path.join(this.outputDir, file.filename),
        inputSize: file.size,
        outputSize: 0,
        ratio: 0,
        format: file.extension.substring(1),
        time: Date.now() - startTime,
        status: 'error',
        error: errorMsg,
      }
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
      logger.debug(`Created output directory: ${this.outputDir}`)
    }
  }

  /**
   * Emit progress callback
   */
  private emitProgress(progress: ProcessingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress)
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Calculate statistics
   */
  private calculateStats(): ProcessingStats {
    const successCount = this.results.filter((r) => r.status === 'success').length
    const errorCount = this.results.filter((r) => r.status === 'error').length
    const skippedCount = this.results.filter((r) => r.status === 'skipped').length

    const totalInputSize = this.results.reduce((sum, r) => sum + r.inputSize, 0)
    const totalOutputSize = this.results.reduce((sum, r) => sum + r.outputSize, 0)
    const totalReduction = totalInputSize - totalOutputSize

    const processingTime = this.results.reduce((sum, r) => sum + r.time, 0)

    return {
      totalFiles: this.results.length,
      processedFiles: this.results.length,
      successCount,
      errorCount,
      skippedCount,
      totalInputSize,
      totalOutputSize,
      totalReduction,
      averageRatio: successCount > 0 ? Math.round(totalReduction / successCount) : 0,
      processingTime,
      filesPerSecond: processingTime > 0 ? Math.round((this.results.length / processingTime) * 1000) : 0,
    }
  }

  /**
   * Log processing summary
   */
  private logSummary(): void {
    const stats = this.calculateStats()

    logger.info('\n📈 Processing Summary:')
    logger.info(`  Total Files: ${stats.totalFiles}`)
    logger.info(`  ✅ Success: ${stats.successCount}`)
    logger.info(`  ❌ Errors: ${stats.errorCount}`)
    logger.info(`  ⏭️  Skipped: ${stats.skippedCount}`)
    logger.info(`  Total Size: ${this.formatBytes(stats.totalInputSize)} → ${this.formatBytes(stats.totalOutputSize)}`)
    logger.info(`  📉 Total Reduction: ${this.formatBytes(stats.totalReduction)} (${stats.averageRatio}%)`)
    logger.info(`  ⏱️  Time: ${(stats.processingTime / 1000).toFixed(2)}s`)
    logger.info(`  🚀 Speed: ${stats.filesPerSecond} files/sec\n`)
  }

  /**
   * Get processing results
   */
  getResults(): ImageOptimizationResult[] {
    return this.results
  }

  /**
   * Get processing statistics
   */
  getStats(): ProcessingStats {
    return this.calculateStats()
  }
}

/**
 * Convenience function to process images
 */
export async function processImages(
  inputDir: string,
  outputDir: string,
  config: ImgminConfig,
  progressCallback?: ProgressCallback,
  errorCallback?: ErrorCallback,
): Promise<ImageOptimizationResult[]> {
  const processor = new Processor(inputDir, outputDir, config, progressCallback, errorCallback)
  return processor.process()
}

export default Processor
