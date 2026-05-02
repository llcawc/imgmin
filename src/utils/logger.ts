/**
 * Logger module - структурированное логирование (TypeScript)
 */

interface LoggerInterface {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
  setLevel(level: string | number): void
  setVerbose(verbose: boolean): void
}

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLevel: LogLevel = LogLevel.INFO
let verboseMode = false

function setLevel(level: string | number): void {
  if (typeof level === 'string') {
    const numLevel = LogLevel[level.toUpperCase() as keyof typeof LogLevel]
    currentLevel = numLevel ?? LogLevel.INFO
  } else {
    currentLevel = level
  }
}

function setVerbose(verbose: boolean): void {
  verboseMode = verbose
  if (verbose) {
    currentLevel = LogLevel.DEBUG
  }
}

function format(level: string, message: string): string {
  if (verboseMode) {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}`
  }
  return message
}

function debug(message: string): void {
  if (currentLevel <= LogLevel.DEBUG) {
    console.log(format('DEBUG', message))
  }
}

function info(message: string): void {
  if (currentLevel <= LogLevel.INFO) {
    console.log(format('INFO', message))
  }
}

function warn(message: string): void {
  if (currentLevel <= LogLevel.WARN) {
    console.warn(format('WARN', message))
  }
}

function error(message: string): void {
  if (currentLevel <= LogLevel.ERROR) {
    console.error(format('ERROR', message))
  }
}

const logger: LoggerInterface = {
  debug,
  info,
  warn,
  error,
  setLevel,
  setVerbose,
}

export { LogLevel }

export { logger }

export default logger
