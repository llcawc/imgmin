/**
 * File Scanner Tests
 */

import fs from 'fs'
import path from 'path'

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

import { scanFiles, filterBySize, sortFiles } from '../../src/file-scanner/file-scanner.ts'

// Директория для тестов
const TEST_DIR = './tests/fixtures/file-scanner-test'
const SUBDIR = path.join(TEST_DIR, 'subdir')

/**
 * Создание тестовых файлов
 */
function createTestFiles() {
  // Создаем основную директорию
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true })
  }

  // Создаем поддиректорию
  if (!fs.existsSync(SUBDIR)) {
    fs.mkdirSync(SUBDIR, { recursive: true })
  }

  // Создаем тестовые файлы
  const testFiles = [
    { path: path.join(TEST_DIR, 'image1.jpg'), size: 1000 },
    { path: path.join(TEST_DIR, 'image2.png'), size: 2000 },
    { path: path.join(TEST_DIR, 'image3.gif'), size: 500 },
    { path: path.join(TEST_DIR, 'style.css'), size: 300 }, // Не должен быть найден
    { path: path.join(SUBDIR, 'image4.jpg'), size: 1500 },
    { path: path.join(SUBDIR, 'image5.svg'), size: 800 },
  ]

  for (const file of testFiles) {
    if (!fs.existsSync(file.path)) {
      fs.writeFileSync(file.path, Buffer.alloc(file.size))
    }
  }
}

/**
 * Удаление тестовых файлов
 */
function cleanupTestFiles() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true })
  }
}

describe('File Scanner', () => {
  beforeAll(() => {
    createTestFiles()
  })

  afterAll(() => {
    cleanupTestFiles()
  })

  describe('scanFiles', () => {
    it('should scan files in directory (non-recursive)', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })

      expect(files).toHaveLength(3) // jpg, png, gif
      expect(files.map((f) => f.filename)).toContain('image1.jpg')
      expect(files.map((f) => f.filename)).toContain('image2.png')
      expect(files.map((f) => f.filename)).toContain('image3.gif')
      expect(files.map((f) => f.filename)).not.toContain('style.css')
    })

    it('should scan files recursively', () => {
      const files = scanFiles(TEST_DIR, { recursive: true })

      expect(files.length).toBeGreaterThanOrEqual(5) // At least 5 image files
      expect(files.map((f) => f.filename)).toContain('image1.jpg')
      expect(files.map((f) => f.filename)).toContain('image4.jpg')
      expect(files.map((f) => f.filename)).toContain('image5.svg')
    })

    it('should filter by specific extensions', () => {
      const files = scanFiles(TEST_DIR, { recursive: false, extensions: ['.jpg', '.png'] })

      expect(files.length).toBeLessThanOrEqual(2)
      expect(files.every((f) => ['.jpg', '.png'].includes(f.extension))).toBe(true)
    })

    it('should return empty array for non-existent directory', () => {
      const files = scanFiles('/nonexistent/path', { recursive: false })

      expect(files).toEqual([])
    })

    it('should set correct file metadata', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })

      const file = files.find((f) => f.filename === 'image1.jpg')
      expect(file).toBeDefined()
      expect(file?.extension).toBe('.jpg')
      expect(file?.size).toBe(1000)
      expect(file?.path).toContain('image1.jpg')
    })
  })

  describe('filterBySize', () => {
    it('should filter by minimum size', () => {
      const files = scanFiles(TEST_DIR, { recursive: true })
      const filtered = filterBySize(files, 1000)

      expect(filtered.every((f) => f.size >= 1000)).toBe(true)
    })

    it('should filter by maximum size', () => {
      const files = scanFiles(TEST_DIR, { recursive: true })
      const filtered = filterBySize(files, undefined, 1500)

      expect(filtered.every((f) => f.size <= 1500)).toBe(true)
    })

    it('should filter by size range', () => {
      const files = scanFiles(TEST_DIR, { recursive: true })
      const filtered = filterBySize(files, 500, 1500)

      expect(filtered.every((f) => f.size >= 500 && f.size <= 1500)).toBe(true)
    })

    it('should return empty array if no files match', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })
      const filtered = filterBySize(files, 10000)

      expect(filtered).toEqual([])
    })
  })

  describe('sortFiles', () => {
    it('should sort by name', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })
      const sorted = sortFiles(files, 'name')

      const names = sorted.map((f) => f.filename)
      expect(names).toEqual([...names].sort())
    })

    it('should sort by size', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })
      const sorted = sortFiles(files, 'size')

      const sizes = sorted.map((f) => f.size)
      expect(sizes).toEqual([...sizes].sort((a, b) => a - b))
    })

    it('should sort by extension', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })
      const sorted = sortFiles(files, 'ext')

      const exts = sorted.map((f) => f.extension)
      expect(exts).toEqual([...exts].sort())
    })

    it('should not modify original array', () => {
      const files = scanFiles(TEST_DIR, { recursive: false })
      const original = [...files]

      sortFiles(files, 'size')

      expect(files).toEqual(original)
    })
  })
})
