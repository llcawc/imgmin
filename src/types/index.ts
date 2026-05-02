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

// Re-export config types
export * from './config.ts'
export * from './result.ts'
export * from './optimizer.ts'
