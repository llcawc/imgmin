/**
 * Logger module - структурированное логирование
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

let currentLevel = LOG_LEVELS.INFO
let verboseMode = false

function setLevel(level) {
  if (typeof level === 'string') {
    currentLevel = LOG_LEVELS[level.toUpperCase()] ?? LOG_LEVELS.INFO
  } else {
    currentLevel = level
  }
}

function setVerbose(verbose) {
  verboseMode = verbose
  if (verbose) {
    currentLevel = LOG_LEVELS.DEBUG
  }
}

function format(level, message) {
  if (verboseMode) {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}`
  }
  return message
}

function debug(message) {
  if (currentLevel <= LOG_LEVELS.DEBUG) {
    console.log(format('DEBUG', message))
  }
}

function info(message) {
  if (currentLevel <= LOG_LEVELS.INFO) {
    console.log(format('INFO', message))
  }
}

function warn(message) {
  if (currentLevel <= LOG_LEVELS.WARN) {
    console.warn(format('WARN', message))
  }
}

function error(message) {
  if (currentLevel <= LOG_LEVELS.ERROR) {
    console.error(format('ERROR', message))
  }
}

export default {
  debug,
  info,
  warn,
  error,
  setLevel,
  setVerbose,
  LOG_LEVELS,
}
