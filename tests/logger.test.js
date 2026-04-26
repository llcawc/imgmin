import { describe, it, expect } from 'vitest'
import logger from '../src/utils/logger.js'

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

  it('should have LOG_LEVELS constant', () => {
    expect(logger.LOG_LEVELS).toBeDefined()
    expect(logger.LOG_LEVELS.DEBUG).toBe(0)
    expect(logger.LOG_LEVELS.INFO).toBe(1)
    expect(logger.LOG_LEVELS.WARN).toBe(2)
    expect(logger.LOG_LEVELS.ERROR).toBe(3)
  })
})
