/**
 * File Scanner - рекурсивный поиск изображений в директориях
 */

import fs from 'fs'
import path from 'path'
import logger from '../utils/logger.ts'

export interface ScanOptions {
  recursive?: boolean
  extensions?: string[]
}

export interface ScannedFile {
  path: string
  filename: string
  extension: string
  size: number
}

const DEFAULT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif']

/**
 * Нормализация расширений файлов
 */
function normalizeExtensions(extensions?: string[]): string[] {
  if (!extensions || extensions.length === 0) {
    return DEFAULT_EXTENSIONS
  }

  return extensions.map((ext) => {
    if (!ext.startsWith('.')) {
      return `.${ext}`
    }
    return ext.toLowerCase()
  })
}

/**
 * Сканирование одной директории (не рекурсивно)
 */
function scanDirectory(dir: string, extensions: string[]): ScannedFile[] {
  const files: ScannedFile[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()

        if (extensions.includes(ext)) {
          const stats = fs.statSync(fullPath)
          files.push({
            path: fullPath,
            filename: entry.name,
            extension: ext,
            size: stats.size,
          })
        }
      }
    }
  } catch (error) {
    logger.warn(`Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`)
  }

  return files
}

/**
 * Рекурсивное сканирование директории
 */
function scanDirectoryRecursive(dir: string, extensions: string[]): ScannedFile[] {
  const files: ScannedFile[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      try {
        if (entry.isDirectory()) {
          // Рекурсивно сканируем поддиректории
          const subFiles = scanDirectoryRecursive(fullPath, extensions)
          files.push(...subFiles)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()

          if (extensions.includes(ext)) {
            const stats = fs.statSync(fullPath)
            files.push({
              path: fullPath,
              filename: entry.name,
              extension: ext,
              size: stats.size,
            })
          }
        }
      } catch (error) {
        logger.warn(`Failed to process ${fullPath}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    logger.warn(`Failed to scan directory ${dir}: ${error instanceof Error ? error.message : String(error)}`)
  }

  return files
}

/**
 * Основная функция сканирования файлов
 */
export function scanFiles(inputDir: string, options: ScanOptions = {}): ScannedFile[] {
  const { recursive = false, extensions } = options
  const normalizedExtensions = normalizeExtensions(extensions)

  // Проверка, что директория существует
  if (!fs.existsSync(inputDir)) {
    logger.error(`Input directory does not exist: ${inputDir}`)
    return []
  }

  // Проверка, что это директория
  const stats = fs.statSync(inputDir)
  if (!stats.isDirectory()) {
    logger.error(`Path is not a directory: ${inputDir}`)
    return []
  }

  logger.info(`🔍 Scanning directory: ${inputDir}`)
  logger.debug(`Recursive: ${recursive}, Extensions: ${normalizedExtensions.join(', ')}`)

  const files = recursive
    ? scanDirectoryRecursive(inputDir, normalizedExtensions)
    : scanDirectory(inputDir, normalizedExtensions)

  logger.info(`✅ Found ${files.length} image files`)

  return files
}

/**
 * Фильтрация файлов по размеру
 */
export function filterBySize(files: ScannedFile[], minSize?: number, maxSize?: number): ScannedFile[] {
  return files.filter((file) => {
    if (minSize && file.size < minSize) {
      return false
    }
    if (maxSize && file.size > maxSize) {
      return false
    }
    return true
  })
}

/**
 * Сортировка файлов
 */
export function sortFiles(files: ScannedFile[], sortBy: 'name' | 'size' | 'ext' = 'name'): ScannedFile[] {
  const sorted = [...files]

  switch (sortBy) {
    case 'size':
      sorted.sort((a, b) => a.size - b.size)
      break
    case 'ext':
      sorted.sort((a, b) => a.extension.localeCompare(b.extension))
      break
    case 'name':
    default:
      sorted.sort((a, b) => a.filename.localeCompare(b.filename))
      break
  }

  return sorted
}

export default {
  scanFiles,
  filterBySize,
  sortFiles,
}
