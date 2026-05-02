/**
 * Type definitions for optimizers
 */

export interface OptimizeResult {
  buffer: Buffer
  format: string
  size: number
  originalSize: number
  ratio: number
  metadata: Record<string, unknown>
}

export interface OptimizerOptions {
  quality?: number
  removeMetadata?: boolean
  progressive?: boolean
}

export interface OptimizeStats {
  originalSize: number
  optimizedSize: number
  ratio: number
  saved: number
  format: string
}
