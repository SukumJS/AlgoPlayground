/**
 * AnimationController
 * Manages animation timers and pause/resume state
 */
export class AnimationController {
  private timers: number[] = [];
  private isPausedRef: React.MutableRefObject<boolean>;

  constructor(isPausedRef: React.MutableRefObject<boolean>) {
    this.isPausedRef = isPausedRef;
  }

  /**
   * Schedule a callback to run after a delay (respects pause state)
   */
  scheduleStep(callback: () => void, delay: number): void {
    const timer = window.setTimeout(() => {
      if (!this.isPausedRef.current) {
        callback();
      }
    }, delay);
    this.timers.push(timer as unknown as number);
  }

  /**
   * Pause all animations
   */
  pause(): void {
    this.isPausedRef.current = true;
  }

  /**
   * Resume animations
   */
  resume(): void {
    this.isPausedRef.current = false;
  }

  /**
   * Clear all scheduled timers
   */
  clearAll(): void {
    this.timers.forEach(id => clearTimeout(id));
    this.timers = [];
  }

  /**
   * Check if currently paused
   */
  get isPaused(): boolean {
    return this.isPausedRef.current;
  }
}
