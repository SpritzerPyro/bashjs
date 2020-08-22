import { execFile } from 'child_process';
import { resolve } from 'path';

interface Logger {
  error(...data: any[]): void;
  info(...data: any[]): void;
  warn(...data: any[]): void;
}

export class Bash {
  constructor(private logger: Logger = console) {}

  public execFile(file: string, env: NodeJS.ProcessEnv = {}): Promise<number> {
    const path = resolve(`${__dirname}/../../..`, file);

    this.logger.info(`Executing '${path}'`);

    return new Promise((resolve, reject) => {
      let code = 0;

      const data = execFile(file, { env }, err => {
        if (err) {
          reject(err);
        }

        resolve(code);
      });

      data.on('close', x => (code = x));
      data.stderr?.on('data', x => this.log(x, this.logger.error));
      data.stdout?.on('data', x => this.log(x, this.logger.info));
    });
  }

  private log(data: string, fn: Function): void {
    fn(data.replace(/\n$/, ''));
  }
}

export function getBash(logger: Logger = console): Bash {
  return new Bash(logger);
}
