/**
 * imgmin - Type definitions
 */

export interface ImageOptimizationResult {
  inputPath: string
  outputPath: string
  inputSize: number
  outputSize: number
  ratio: number
  format: string
  time: number
  status: 'success' | 'error' | 'skipped'
  error?: string
}

export interface CliOptions {
  input?: string
  output?: string
  config?: string
  quality?: number
  removeMetadata?: boolean
  convertWebp?: boolean
  convertAvif?: boolean
  workers?: number
  verbose?: boolean
}

export interface ImageFormat {
  quality?: number
  progressive?: boolean
  removeMetadata?: boolean
  optimizationLevel?: number
  minify?: boolean
}

export type FormatName = 'jpg' | 'png' | 'gif' | 'svg'
export type OutputFormat = 'webp' | 'avif'
