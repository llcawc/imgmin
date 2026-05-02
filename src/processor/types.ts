/**
 * Processor types and interfaces
 */

import type { ImageOptimizationResult } from '../types/index'

export interface ProcessorOptions {
  recursive?: boolean
  workers?: number
  verbose?: boolean
  dryRun?: boolean
}

export interface ProcessingStats {
  totalFiles: number
  processedFiles: number
  successCount: number
  errorCount: number
  skippedCount: number
  totalInputSize: number
  totalOutputSize: number
  totalReduction: number
  averageRatio: number
  processingTime: number
  filesPerSecond: number
}

export interface ProcessingProgress {
  current: number
  total: number
  percentage: number
  currentFile?: string
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export interface ProcessorConfig {
  inputDir: string
  outputDir: string
  options: ProcessorOptions
  configPath?: string
}

export type ProgressCallback = (progress: ProcessingProgress) => void
export type ErrorCallback = (error: Error, file?: string) => void
