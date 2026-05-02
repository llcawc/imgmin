/**
 * Result type definitions
 */

export interface ProcessResult {
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

export interface ConversionResult {
  format: 'webp' | 'avif'
  outputPath: string
  outputSize: number
  ratio: number
  time: number
}

export interface FileProcessingResult extends ProcessResult {
  conversions?: ConversionResult[]
}
