/**
 * Configuration validation schema using Zod
 * Ensures type safety and runtime validation
 */

import { z } from 'zod'

const JPGOptionsSchema = z.object({
  quality: z.number().min(0).max(100).default(80),
  progressive: z.boolean().default(true),
  removeMetadata: z.boolean().default(true),
  chromaSubsampling: z.enum(['4:4:4', '4:2:2', '4:2:0']).optional(),
})

const PNGOptionsSchema = z.object({
  compressionLevel: z.number().min(1).max(9).default(9),
  progressive: z.boolean().default(false),
  removeMetadata: z.boolean().default(true),
})

const GIFOptionsSchema = z.object({
  optimizationLevel: z.number().min(1).max(3).default(3),
  removeMetadata: z.boolean().default(true),
})

const SVGOptionsSchema = z.object({
  minify: z.boolean().default(true),
})

const ConvertOptionsSchema = z.object({
  enabled: z.boolean().default(false),
  quality: z.number().min(0).max(100).default(80),
})

const OutputOptionsSchema = z.object({
  preserveStructure: z.boolean().default(true),
  suffix: z.string().default(''),
})

const ImageFormatConfigSchema = z.object({
  jpg: JPGOptionsSchema,
  png: PNGOptionsSchema,
  gif: GIFOptionsSchema,
  svg: SVGOptionsSchema,
})

const ConvertToConfigSchema = z.object({
  webp: ConvertOptionsSchema,
  avif: ConvertOptionsSchema,
})

export const ImgminConfigSchema = z.object({
  formats: ImageFormatConfigSchema,
  convertTo: ConvertToConfigSchema,
  output: OutputOptionsSchema,
  workers: z.number().min(1).max(16).default(1),
  verbose: z.boolean().default(false),
})

export type ValidatedConfig = z.infer<typeof ImgminConfigSchema>

/**
 * Validate configuration object
 * @throws {z.ZodError} if validation fails
 */
export function validateConfig(config: unknown): ValidatedConfig {
  return ImgminConfigSchema.parse(config)
}

/**
 * Safely validate configuration (returns null on error)
 */
export function safeValidateConfig(config: unknown): ValidatedConfig | null {
  const result = ImgminConfigSchema.safeParse(config)
  return result.success ? result.data : null
}
