/**
 * Configuration type definitions
 */

export interface JPGOptions {
  quality: number
  progressive: boolean
  removeMetadata: boolean
  chromaSubsampling?: '4:4:4' | '4:2:2' | '4:2:0'
}

export interface PNGOptions {
  compressionLevel: number
  progressive: boolean
  removeMetadata: boolean
}

export interface GIFOptions {
  optimizationLevel: number
  removeMetadata: boolean
}

export interface SVGOptions {
  minify: boolean
}

export interface ConvertOptions {
  enabled: boolean
  quality: number
}

export interface OutputOptions {
  preserveStructure: boolean
  suffix: string
}

export interface ImageFormatConfig {
  jpg: JPGOptions
  png: PNGOptions
  gif: GIFOptions
  svg: SVGOptions
}

export interface ConvertToConfig {
  webp: ConvertOptions
  avif: ConvertOptions
}

export interface ImgminConfig {
  formats: ImageFormatConfig
  convertTo: ConvertToConfig
  output: OutputOptions
  workers?: number
  verbose?: boolean
}

export type ConfigSource = 'cli' | 'json' | 'defaults'
