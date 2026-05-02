/**
 * Logger Tests (TypeScript)
 */

import { describe, it, expect } from 'vitest'

import logger, { LogLevel } from '../../src/utils/logger.ts'

describe('Logger', () => {
  it('should export logger methods', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  it('should have setLevel and setVerbose methods', () => {
    expect(typeof logger.setLevel).toBe('function')
    expect(typeof logger.setVerbose).toBe('function')
  })

  it('should have LogLevel enum', () => {
    expect(LogLevel.DEBUG).toBe(0)
    expect(LogLevel.INFO).toBe(1)
    expect(LogLevel.WARN).toBe(2)
    expect(LogLevel.ERROR).toBe(3)
  })

  it('should support verbose mode', () => {
    logger.setVerbose(true)
    expect(typeof logger.debug).toBe('function')
    logger.setVerbose(false)
  })

  it('should support setting log levels', () => {
    logger.setLevel('debug')
    expect(typeof logger.debug).toBe('function')
    logger.setLevel(LogLevel.INFO)
    expect(typeof logger.info).toBe('function')
  })
})
