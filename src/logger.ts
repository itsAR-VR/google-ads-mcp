export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const order: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

export class Logger {
  constructor(private readonly level: LogLevel) {}

  private shouldLog(level: LogLevel): boolean {
    return order[level] >= order[this.level];
  }

  private emit(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) return;
    const payload = meta === undefined ? '' : ` ${JSON.stringify(meta)}`;
    console.error(`[google-ads-mcp] [${level}] ${message}${payload}`);
  }

  debug(message: string, meta?: unknown): void {
    this.emit('debug', message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.emit('info', message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.emit('warn', message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.emit('error', message, meta);
  }
}
