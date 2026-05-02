/**
 * Progress tracking utilities
 */

import type { ProcessingProgress } from './types'

export interface ProgressTracker {
  update(progress: ProcessingProgress): void
  complete(): void
  getProgress(): ProcessingProgress
}

/**
 * Simple progress tracker
 */
export class SimpleProgressTracker implements ProgressTracker {
  private progress: ProcessingProgress = {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'pending',
  }

  update(progress: ProcessingProgress): void {
    this.progress = progress
    this.displayProgress()
  }

  complete(): void {
    this.progress.status = 'completed'
    this.progress.percentage = 100
    this.displayProgress()
  }

  getProgress(): ProcessingProgress {
    return { ...this.progress }
  }

  private displayProgress(): void {
    if (this.progress.currentFile) {
      console.log(
        `[${this.progress.current}/${this.progress.total}] ${this.progress.percentage}% - ${this.progress.currentFile}`,
      )
    }
  }
}

/**
 * Silent progress tracker (no console output)
 */
export class SilentProgressTracker implements ProgressTracker {
  private progress: ProcessingProgress = {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'pending',
  }

  update(progress: ProcessingProgress): void {
    this.progress = progress
  }

  complete(): void {
    this.progress.status = 'completed'
    this.progress.percentage = 100
  }

  getProgress(): ProcessingProgress {
    return { ...this.progress }
  }
}

/**
 * Detailed progress tracker with timing
 */
export class DetailedProgressTracker implements ProgressTracker {
  private progress: ProcessingProgress = {
    current: 0,
    total: 0,
    percentage: 0,
    status: 'pending',
  }

  private startTime: number = Date.now()
  private lastUpdate: number = Date.now()

  update(progress: ProcessingProgress): void {
    this.progress = progress
    const elapsed = Date.now() - this.startTime
    const estimatedTotal = (elapsed / progress.percentage) * 100
    const estimatedRemaining = estimatedTotal - elapsed

    this.displayDetailedProgress(estimatedRemaining)
    this.lastUpdate = Date.now()
  }

  complete(): void {
    this.progress.status = 'completed'
    this.progress.percentage = 100
    const totalTime = (Date.now() - this.startTime) / 1000
    console.log(`\n✅ Completed in ${totalTime.toFixed(2)}s`)
  }

  getProgress(): ProcessingProgress {
    return { ...this.progress }
  }

  private displayDetailedProgress(estimatedRemaining: number): void {
    const mins = Math.floor(estimatedRemaining / 60000)
    const secs = Math.floor((estimatedRemaining % 60000) / 1000)

    if (this.progress.currentFile) {
      console.log(
        `[${this.progress.current}/${this.progress.total}] ${this.progress.percentage}% - ` +
          `${this.progress.currentFile} - ETA: ${mins}m ${secs}s`,
      )
    }
  }
}

export default SimpleProgressTracker
