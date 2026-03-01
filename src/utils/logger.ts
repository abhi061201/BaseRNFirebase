import { Tag } from "@/core/types/loggerTags";

class Logger {
  // Store original console methods
  private originalConsole = {
    log: console.log,
    error: console.error,
    debug: console.debug,
  };

  /**
   * Regular log
   */
  log(tag: Tag | string, ...args: any[]) {
    this.originalConsole.log(tag, ...args);
  }

  /**
   * Info log
   */
  info(tag: Tag | string, ...args: any[]) {
    this.originalConsole.log('[INFO]', tag, ...args);
  }

  /**
   * Warning log
   */
  warn(tag: Tag | string, ...args: any[]) {
    this.originalConsole.log('[WARN]', tag, ...args);
  }

  /**
   * Error log
   */
  error(tag: Tag | string,...args: any[]) {
    this.originalConsole.error(tag,...args);
  }

  /**
   * Debug log
   */
  debug(tag: Tag | string,...args: any[]) {
    this.originalConsole.debug(tag,...args);
  }

  /**
   * Override global console methods
   */
  overrideConsole() {
    console.log = this.log.bind(this);
    console.error = this.error.bind(this);
    console.debug = this.debug.bind(this);
  }

  /**
   * Restore original console methods
   */
  restoreConsole() {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
  }
}

// Create singleton instance
export const logger = new Logger();

// Export default logger
export default logger;
